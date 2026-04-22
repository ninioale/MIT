const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const ANSES_API_BASE =
  process.env.ANSES_API_BASE || "https://servicioswww.anses.gob.ar/ooss2/api/cuil";

const WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

function normalizeSexo(sexo) {
  if (!sexo) return null;
  const value = String(sexo).trim().toUpperCase();
  if (["M", "MASCULINO", "H", "HOMBRE"].includes(value)) return "M";
  if (["F", "FEMENINO", "MUJER"].includes(value)) return "F";
  if (["X", "NB", "NO BINARIO", "NOBINARIO"].includes(value)) return "X";
  return null;
}

function calcularCuilLocal(dni, sexoNormalizado) {
  const dniStr = String(dni).replace(/\D/g, "").padStart(8, "0");
  if (dniStr.length !== 8) {
    throw new Error("El DNI debe tener hasta 8 dígitos numéricos");
  }

  let prefijo = "20";
  if (sexoNormalizado === "F") prefijo = "27";
  if (sexoNormalizado === "X") prefijo = "23";

  const base = `${prefijo}${dniStr}`;
  const suma = base
    .split("")
    .reduce((acc, digit, i) => acc + Number(digit) * WEIGHTS[i], 0);

  const resto = suma % 11;
  let verificador = 11 - resto;

  if (verificador === 11) verificador = 0;

  if (verificador === 10) {
    prefijo = sexoNormalizado === "F" ? "23" : "24";
    const baseAlt = `${prefijo}${dniStr}`;
    const sumaAlt = baseAlt
      .split("")
      .reduce((acc, digit, i) => acc + Number(digit) * WEIGHTS[i], 0);
    const restoAlt = sumaAlt % 11;
    verificador = 11 - restoAlt;
    if (verificador === 11) verificador = 0;
  }

  return `${prefijo}-${dniStr}-${verificador}`;
}

function extraerCuil(payload) {
  if (!payload) return null;
  const candidatos = [
    payload.cuil,
    payload.CUIL,
    payload.cuit,
    payload.CUIT,
    payload.data?.cuil,
    payload.data?.CUIL,
    payload.result?.cuil,
    payload.resultado?.cuil,
  ];
  return candidatos.find((x) => typeof x === "string" || typeof x === "number") || null;
}

async function consultarAnses(dni, sexoNormalizado) {
  const intentos = [
    `${ANSES_API_BASE}/${dni}?sexo=${sexoNormalizado}`,
    `${ANSES_API_BASE}?dni=${dni}&sexo=${sexoNormalizado}`,
  ];

  for (const url of intentos) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) continue;

      const payload = await response.json();
      const cuil = extraerCuil(payload);
      if (cuil) {
        return {
          cuil: String(cuil),
          fuente: "ANSES",
          endpointConsumido: url,
        };
      }
    } catch (_error) {
      // Continua con el próximo intento.
    }
  }

  return null;
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function serveStatic(req, res) {
  const urlPath = req.url === "/" ? "/index.html" : req.url;
  const sanitized = path.normalize(urlPath).replace(/^([.][.][/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, sanitized);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      ".html": "text/html; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json; charset=utf-8",
    };

    res.writeHead(200, { "Content-Type": contentTypes[ext] || "text/plain; charset=utf-8" });
    res.end(data);
  });
}

async function handleApiCuil(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 1_000_000) {
      req.socket.destroy();
    }
  });

  req.on("end", async () => {
    try {
      const payload = body ? JSON.parse(body) : {};
      const { dni, sexo } = payload;
      const sexoNormalizado = normalizeSexo(sexo);

      if (!dni) {
        return sendJson(res, 400, { error: "El campo dni es obligatorio" });
      }

      if (!sexoNormalizado) {
        return sendJson(res, 400, {
          error: "El campo sexo es obligatorio y debe ser M, F o X",
        });
      }

      const ansesResult = await consultarAnses(dni, sexoNormalizado);
      if (ansesResult) return sendJson(res, 200, ansesResult);

      const cuil = calcularCuilLocal(dni, sexoNormalizado);
      return sendJson(res, 200, {
        cuil,
        fuente: "Algoritmo local (fallback)",
        detalle: "No fue posible obtener respuesta válida de la API de ANSES configurada.",
      });
    } catch (error) {
      return sendJson(res, 500, {
        error: "Error interno calculando el CUIL",
        detalle: error.message,
      });
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/cuil") {
    handleApiCuil(req, res);
    return;
  }

  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
