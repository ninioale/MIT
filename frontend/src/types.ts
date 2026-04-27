export type PaymentMethod = {
  id: number;
  user_id: number;
  bank: string;
  card_network?: string | null;
  type: string;
  wallet_name?: string | null;
  segment: string;
  active: boolean;
};

export type Promotion = {
  id: number;
  title: string;
  merchant_name?: string | null;
  category: string;
  bank?: string | null;
  card_network?: string | null;
  payment_type?: string | null;
  wallet_required?: string | null;
  discount_percent: number;
  cashback_cap?: number | null;
  min_purchase?: number | null;
  valid_from: string;
  valid_to: string;
  weekdays?: string | null;
  conditions_text?: string | null;
  source_url?: string | null;
};

export type Recommendation = {
  payment_method_id: number;
  payment_label: string;
  promotion_title: string;
  saving: number;
  final_price: number;
  reason: string;
};
