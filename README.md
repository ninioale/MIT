# Ahorrando ando (MVP)

MVP web para simular compras futuras y recomendar el mejor medio de pago según promociones.

## Stack
- Frontend: React + TypeScript (Vite)
- Backend: FastAPI + SQLAlchemy
- DB: SQLite

## Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Frontend
```bash
cd frontend
npm install
npm run dev
```

## Flujo sugerido
1. Crear usuario en `POST /users`.
2. Cargar medios de pago en `POST /payment-methods`.
3. Cargar promociones en `POST /promotions` o `POST /seed`.
4. Simular compra con `POST /simulate`.

## Tests
```bash
cd backend
pytest
```
