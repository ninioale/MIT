type Props = {
  active: string;
  onChange: (view: string) => void;
};

const views = [
  { id: "home", label: "Home" },
  { id: "payment", label: "Medios" },
  { id: "promo", label: "Promos" },
  { id: "result", label: "Resultado" },
];

export function Nav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {views.map((view) => (
        <button
          key={view.id}
          className={active === view.id ? "active" : ""}
          onClick={() => onChange(view.id)}
        >
          {view.label}
        </button>
      ))}
    </nav>
  );
}
