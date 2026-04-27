import { PaymentMethod, Promotion, Recommendation } from "./types";

const API_BASE = "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.detail || payload.error || "Error de API");
  }
  return response.json();
}

export const api = {
  listUsers: () => request<{ id: number; email: string; name: string }[]>("/users"),
  createUser: (data: { email: string; name: string }) => request<{ id: number; email: string; name: string }>("/users", { method: "POST", body: JSON.stringify(data) }),
  listPaymentMethods: (userId: number) => request<PaymentMethod[]>(`/payment-methods?user_id=${userId}`),
  createPaymentMethod: (data: Omit<PaymentMethod, "id">) =>
    request<PaymentMethod>("/payment-methods", { method: "POST", body: JSON.stringify(data) }),
  listPromotions: () => request<Promotion[]>("/promotions"),
  createPromotion: (data: Omit<Promotion, "id">) =>
    request<Promotion>("/promotions", { method: "POST", body: JSON.stringify(data) }),
  simulate: (data: { user_id: number; merchant_name: string; category: string; amount: number; date: string }) =>
    request<{ best_option: Recommendation | null; ranking: Recommendation[] }>("/simulate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  seed: () => request<{ message: string }>("/seed", { method: "POST" }),
};
