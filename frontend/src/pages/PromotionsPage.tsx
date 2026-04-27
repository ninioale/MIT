import type { FormEvent } from "react";

import { Promotion } from "../types";

type PromotionInput = Omit<Promotion, "id">;

type Props = {
  promotions: Promotion[];
  onCreate: (data: PromotionInput) => Promise<void>;
  onSeed: () => Promise<void>;
};

export function PromotionsPage({ promotions, onCreate, onSeed }: Props) {
  return (
    <section className="card">
      <h2>Promociones</h2>
      <button onClick={onSeed}>Cargar 10 promos de ejemplo</button>
      <PromotionForm onSubmit={onCreate} />
      <ul>
        {promotions.map((p) => (
          <li key={p.id}>{p.title} · {p.discount_percent}% · tope ${p.cashback_cap ?? "sin tope"}</li>
        ))}
      </ul>
    </section>
  );
}

function PromotionForm({ onSubmit }: { onSubmit: (data: PromotionInput) => Promise<void> }) {
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await onSubmit({
      title: String(data.get("title")),
      merchant_name: String(data.get("merchant_name")) || null,
      category: String(data.get("category")),
      bank: String(data.get("bank")) || null,
      card_network: String(data.get("card_network")) || null,
      payment_type: String(data.get("payment_type")) || null,
      wallet_required: String(data.get("wallet_required")) || null,
      discount_percent: Number(data.get("discount_percent")),
      cashback_cap: data.get("cashback_cap") ? Number(data.get("cashback_cap")) : null,
      min_purchase: data.get("min_purchase") ? Number(data.get("min_purchase")) : null,
      valid_from: String(data.get("valid_from")),
      valid_to: String(data.get("valid_to")),
      weekdays: String(data.get("weekdays")) || null,
      conditions_text: String(data.get("conditions_text")) || null,
      source_url: String(data.get("source_url")) || null,
    });
    event.currentTarget.reset();
  };

  return (
    <form className="grid" onSubmit={submit}>
      <input name="title" placeholder="Título" required />
      <input name="merchant_name" placeholder="Comercio" />
      <input name="category" placeholder="Categoría" defaultValue="otros" required />
      <input name="bank" placeholder="Banco" />
      <input name="card_network" placeholder="Red" />
      <input name="payment_type" placeholder="Tipo pago" />
      <input name="wallet_required" placeholder="Billetera requerida" />
      <input type="number" name="discount_percent" placeholder="% descuento" required />
      <input type="number" name="cashback_cap" placeholder="Tope" />
      <input type="number" name="min_purchase" placeholder="Compra mínima" />
      <input type="date" name="valid_from" required />
      <input type="date" name="valid_to" required />
      <input name="weekdays" placeholder="Días (mon,tue...)" />
      <input name="conditions_text" placeholder="Condiciones" />
      <input name="source_url" placeholder="URL origen" />
      <button type="submit">Agregar promo</button>
    </form>
  );
}
