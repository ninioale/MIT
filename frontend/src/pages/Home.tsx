type Props = {
  form: {
    merchant_name: string;
    category: string;
    amount: number;
    date: string;
  };
  onChange: (field: string, value: string) => void;
  onSimulate: () => Promise<void>;
};

export function Home({ form, onChange, onSimulate }: Props) {
  return (
    <section className="card">
      <h2>Simulador rápido</h2>
      <input value={form.merchant_name} onChange={(e) => onChange("merchant_name", e.target.value)} placeholder="Comercio (ej: Carrefour)" />
      <select value={form.category} onChange={(e) => onChange("category", e.target.value)}>
        <option value="supermercado">Supermercado</option>
        <option value="combustible">Combustible</option>
        <option value="farmacia">Farmacia</option>
        <option value="gastronomia">Gastronomía</option>
        <option value="indumentaria">Indumentaria</option>
        <option value="online">Online</option>
        <option value="otros">Otros</option>
      </select>
      <input type="number" value={form.amount} onChange={(e) => onChange("amount", e.target.value)} placeholder="Monto" />
      <input type="date" value={form.date} onChange={(e) => onChange("date", e.target.value)} />
      <button onClick={onSimulate}>Buscar mejor opción</button>
    </section>
  );
}
