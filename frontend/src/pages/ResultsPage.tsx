import { Recommendation } from "../types";

export function ResultsPage({ ranking }: { ranking: Recommendation[] }) {
  return (
    <section className="card">
      <h2>Resultado de recomendación</h2>
      {!ranking.length ? <p>Simulá una compra para ver opciones.</p> : null}
      <ol>
        {ranking.map((r) => (
          <li key={`${r.payment_method_id}-${r.promotion_title}`}>
            <strong>{r.payment_label}</strong> con <em>{r.promotion_title}</em><br />
            Ahorrás ${r.saving.toFixed(2)} y pagás ${r.final_price.toFixed(2)}
          </li>
        ))}
      </ol>
    </section>
  );
}
