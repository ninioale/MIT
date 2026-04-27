import type { FormEvent } from "react";

import { PaymentMethod } from "../types";

type PaymentMethodInput = Omit<PaymentMethod, "id" | "user_id">;

type Props = {
  methods: PaymentMethod[];
  onCreate: (data: PaymentMethodInput) => Promise<void>;
};

export function PaymentMethodsPage({ methods, onCreate }: Props) {
  return (
    <section className="card">
      <h2>Medios de pago</h2>
      <PaymentMethodForm onSubmit={onCreate} />
      <ul>
        {methods.map((m) => (
          <li key={m.id}>{m.bank} · {m.type} {m.card_network ?? ""} {m.wallet_name ? `(${m.wallet_name})` : ""}</li>
        ))}
      </ul>
    </section>
  );
}

function PaymentMethodForm({ onSubmit }: { onSubmit: (data: PaymentMethodInput) => Promise<void> }) {
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await onSubmit({
      bank: String(data.get("bank")),
      card_network: String(data.get("card_network")) || null,
      type: String(data.get("type")),
      wallet_name: String(data.get("wallet_name")) || null,
      segment: String(data.get("segment")) || "normal",
      active: true,
    });
    event.currentTarget.reset();
  };

  return (
    <form className="grid" onSubmit={submit}>
      <input name="bank" placeholder="Banco" required />
      <input name="card_network" placeholder="Red (Visa/Mastercard)" />
      <select name="type" defaultValue="credit">
        <option value="credit">Crédito</option>
        <option value="debit">Débito</option>
        <option value="wallet">Billetera</option>
      </select>
      <input name="wallet_name" placeholder="Nombre de billetera" />
      <input name="segment" placeholder="Segmento" defaultValue="normal" />
      <button type="submit">Agregar medio</button>
    </form>
  );
}
