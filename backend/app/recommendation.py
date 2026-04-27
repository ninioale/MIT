from datetime import date
from typing import Any, Iterable

WEEKDAY_MAP = {
    0: "mon",
    1: "tue",
    2: "wed",
    3: "thu",
    4: "fri",
    5: "sat",
    6: "sun",
}


def _normalize(value: str | None) -> str | None:
    return value.strip().lower() if value else None


def promotion_applies(payment_method: Any, promotion: Any, purchase_date: date, merchant_name: str, category: str, amount: float) -> bool:
    if not payment_method.active:
        return False

    merchant_norm = _normalize(merchant_name)
    category_norm = _normalize(category)

    if promotion.bank and _normalize(promotion.bank) != _normalize(payment_method.bank):
        return False

    if promotion.payment_type and _normalize(promotion.payment_type) != _normalize(payment_method.type):
        return False

    if promotion.card_network and _normalize(promotion.card_network) != _normalize(payment_method.card_network):
        return False

    if promotion.wallet_required and _normalize(promotion.wallet_required) != _normalize(payment_method.wallet_name):
        return False

    if promotion.category and _normalize(promotion.category) not in {"otros", category_norm}:
        return False

    if promotion.merchant_name and _normalize(promotion.merchant_name) != merchant_norm:
        return False

    if promotion.min_purchase and amount < promotion.min_purchase:
        return False

    if purchase_date < promotion.valid_from or purchase_date > promotion.valid_to:
        return False

    if promotion.weekdays:
        valid_days = {_normalize(day) for day in promotion.weekdays.split(",")}
        if WEEKDAY_MAP[purchase_date.weekday()] not in valid_days:
            return False

    return True


def effective_saving(amount: float, discount_percent: float, cashback_cap: float | None) -> float:
    estimated = amount * discount_percent / 100
    if cashback_cap is None:
        return round(estimated, 2)
    return round(min(estimated, cashback_cap), 2)


def build_recommendations(
    payment_methods: Iterable[Any],
    promotions: Iterable[Any],
    merchant_name: str,
    category: str,
    amount: float,
    purchase_date: date,
):
    rows = []

    for pm in payment_methods:
        for promo in promotions:
            if not promotion_applies(pm, promo, purchase_date, merchant_name, category, amount):
                continue

            saving = effective_saving(amount, promo.discount_percent, promo.cashback_cap)
            final_price = round(amount - saving, 2)
            label = f"{pm.bank} {pm.type}" + (f" {pm.card_network}" if pm.card_network else "") + (
                f" ({pm.wallet_name})" if pm.wallet_name else ""
            )
            rows.append(
                {
                    "payment_method_id": pm.id,
                    "payment_label": label.strip(),
                    "promotion_title": promo.title,
                    "saving": saving,
                    "final_price": final_price,
                    "reason": f"Conviene usar {label.strip()} porque ahorrás ${saving:.2f} y pagás final ${final_price:.2f}.",
                }
            )

    rows.sort(key=lambda row: row["saving"], reverse=True)
    return rows
