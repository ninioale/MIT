import { useEffect, useState } from "react";

import { api } from "./api";
import { Nav } from "./components/Nav";
import { Home } from "./pages/Home";
import { PaymentMethodsPage } from "./pages/PaymentMethodsPage";
import { PromotionsPage } from "./pages/PromotionsPage";
import { ResultsPage } from "./pages/ResultsPage";
import { PaymentMethod, Promotion, Recommendation } from "./types";

export default function App() {
  const [view, setView] = useState("home");
  const [userId, setUserId] = useState<number | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [ranking, setRanking] = useState<Recommendation[]>([]);
  const [form, setForm] = useState({
    merchant_name: "Carrefour",
    category: "supermercado",
    amount: 20000,
    date: "2026-04-29",
  });

  const ensureUser = async () => {
    const users = await api.listUsers();
    if (users.length) {
      setUserId(users[0].id);
      return users[0].id;
    }
    const newUser = await api.createUser({ email: "demo@ahorrandoando.app", name: "Demo" });
    setUserId(newUser.id);
    return newUser.id;
  };

  const loadAll = async (uid: number) => {
    const [methodRows, promoRows] = await Promise.all([api.listPaymentMethods(uid), api.listPromotions()]);
    setMethods(methodRows);
    setPromotions(promoRows);
  };

  useEffect(() => {
    (async () => {
      const uid = await ensureUser();
      await loadAll(uid);
    })().catch(console.error);
  }, []);

  const simulate = async () => {
    if (!userId) return;
    const response = await api.simulate({ ...form, user_id: userId });
    setRanking(response.ranking);
    setView("result");
  };

  return (
    <div className="container">
      <header>
        <h1>Ahorrando ando</h1>
        <p>Elegí cómo pagar y maximizá tu ahorro.</p>
      </header>

      {view === "home" ? (
        <Home
          form={form}
          onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: field === "amount" ? Number(value) : value }))}
          onSimulate={simulate}
        />
      ) : null}

      {view === "payment" && userId ? (
        <PaymentMethodsPage
          methods={methods}
          onCreate={async (payload) => {
            await api.createPaymentMethod({ ...payload, user_id: userId });
            await loadAll(userId);
          }}
        />
      ) : null}

      {view === "promo" && userId ? (
        <PromotionsPage
          promotions={promotions}
          onSeed={async () => {
            await api.seed();
            await loadAll(userId);
          }}
          onCreate={async (payload) => {
            await api.createPromotion(payload);
            await loadAll(userId);
          }}
        />
      ) : null}

      {view === "result" ? <ResultsPage ranking={ranking} /> : null}

      <Nav active={view} onChange={setView} />
    </div>
  );
}
