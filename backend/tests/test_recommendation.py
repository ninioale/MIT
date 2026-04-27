from datetime import date
from types import SimpleNamespace

from app.recommendation import build_recommendations, effective_saving, promotion_applies


def make_pm(**kwargs):
    defaults = {
        "id": 1,
        "user_id": 1,
        "bank": "Galicia",
        "card_network": "Visa",
        "type": "credit",
        "wallet_name": None,
        "segment": "normal",
        "active": True,
    }
    defaults.update(kwargs)
    return SimpleNamespace(**defaults)


def make_promo(**kwargs):
    defaults = {
        "id": 1,
        "title": "Promo test",
        "merchant_name": "Carrefour",
        "category": "supermercado",
        "bank": "Galicia",
        "card_network": "Visa",
        "payment_type": "credit",
        "wallet_required": None,
        "discount_percent": 20,
        "cashback_cap": 1000,
        "min_purchase": 1000,
        "valid_from": date(2026, 1, 1),
        "valid_to": date(2026, 12, 31),
        "weekdays": "wed",
        "conditions_text": "",
        "source_url": "",
    }
    defaults.update(kwargs)
    return SimpleNamespace(**defaults)


def test_effective_saving_respects_cap():
    assert effective_saving(20000, 25, 3000) == 3000


def test_effective_saving_without_cap():
    assert effective_saving(10000, 15, None) == 1500


def test_promotion_applies_with_matching_fields():
    pm = make_pm()
    promo = make_promo()
    applies = promotion_applies(pm, promo, date(2026, 4, 1), "Carrefour", "supermercado", 15000)
    assert applies is True


def test_promotion_fails_by_weekday():
    pm = make_pm()
    promo = make_promo(weekdays="fri")
    applies = promotion_applies(pm, promo, date(2026, 4, 1), "Carrefour", "supermercado", 15000)
    assert applies is False


def test_build_recommendations_sorts_by_saving_desc():
    pm_1 = make_pm(id=1, bank="Galicia")
    pm_2 = make_pm(id=2, bank="BBVA")

    promo_1 = make_promo(id=1, bank="Galicia", discount_percent=15, cashback_cap=5000)
    promo_2 = make_promo(id=2, bank="BBVA", discount_percent=25, cashback_cap=5000)

    ranking = build_recommendations(
        [pm_1, pm_2],
        [promo_1, promo_2],
        merchant_name="Carrefour",
        category="supermercado",
        amount=12000,
        purchase_date=date(2026, 4, 1),
    )

    assert len(ranking) == 2
    assert ranking[0]["payment_method_id"] == 2
    assert ranking[0]["saving"] >= ranking[1]["saving"]
