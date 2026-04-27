from datetime import date

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db
from .recommendation import build_recommendations

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ahorrando ando API", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/users", response_model=schemas.UserRead)
def create_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    user = models.User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/users", response_model=list[schemas.UserRead])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()


@app.post("/payment-methods", response_model=schemas.PaymentMethodRead)
def create_payment_method(payload: schemas.PaymentMethodCreate, db: Session = Depends(get_db)):
    if not db.get(models.User, payload.user_id):
        raise HTTPException(status_code=404, detail="User no encontrado")
    payment_method = models.PaymentMethod(**payload.model_dump())
    db.add(payment_method)
    db.commit()
    db.refresh(payment_method)
    return payment_method


@app.get("/payment-methods", response_model=list[schemas.PaymentMethodRead])
def list_payment_methods(user_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(models.PaymentMethod)
    if user_id is not None:
        query = query.filter(models.PaymentMethod.user_id == user_id)
    return query.all()


@app.post("/promotions", response_model=schemas.PromotionRead)
def create_promotion(payload: schemas.PromotionCreate, db: Session = Depends(get_db)):
    promotion = models.Promotion(**payload.model_dump())
    db.add(promotion)
    db.commit()
    db.refresh(promotion)
    return promotion


@app.get("/promotions", response_model=list[schemas.PromotionRead])
def list_promotions(db: Session = Depends(get_db)):
    return db.query(models.Promotion).all()


@app.post("/simulate", response_model=schemas.RecommendationResponse)
def simulate_purchase(payload: schemas.PurchaseSimulationIn, db: Session = Depends(get_db)):
    if not db.get(models.User, payload.user_id):
        raise HTTPException(status_code=404, detail="User no encontrado")

    payment_methods = (
        db.query(models.PaymentMethod)
        .filter(models.PaymentMethod.user_id == payload.user_id)
        .filter(models.PaymentMethod.active.is_(True))
        .all()
    )
    promotions = db.query(models.Promotion).all()

    ranking = build_recommendations(
        payment_methods,
        promotions,
        merchant_name=payload.merchant_name,
        category=payload.category,
        amount=payload.amount,
        purchase_date=payload.date,
    )

    return {"best_option": ranking[0] if ranking else None, "ranking": ranking}


@app.post("/seed")
def seed_data(db: Session = Depends(get_db)):
    if db.query(models.Promotion).count() > 0:
        return {"message": "Las promociones ya estaban cargadas"}

    sample_promotions = [
        models.Promotion(title="25% Carrefour con Galicia", merchant_name="Carrefour", category="supermercado", bank="Galicia", card_network="Visa", payment_type="credit", wallet_required=None, discount_percent=25, cashback_cap=8000, min_purchase=15000, valid_from=date(2026, 4, 1), valid_to=date(2026, 6, 30), weekdays="wed", conditions_text="Tope semanal por cliente", source_url="https://example.com/galicia-carrefour"),
        models.Promotion(title="20% YPF Santander", merchant_name="YPF", category="combustible", bank="Santander", card_network="Mastercard", payment_type="credit", wallet_required=None, discount_percent=20, cashback_cap=6000, min_purchase=10000, valid_from=date(2026, 4, 1), valid_to=date(2026, 5, 31), weekdays="thu", conditions_text="Exclusivo app banco", source_url="https://example.com/santander-ypf"),
        models.Promotion(title="30% Farmacity Cuenta DNI", merchant_name="Farmacity", category="farmacia", bank=None, card_network=None, payment_type="wallet", wallet_required="Cuenta DNI", discount_percent=30, cashback_cap=5000, min_purchase=5000, valid_from=date(2026, 4, 1), valid_to=date(2026, 12, 31), weekdays="mon,tue", conditions_text="Solo QR", source_url="https://example.com/cuentadni-farmacity"),
        models.Promotion(title="15% Shell BBVA Débito", merchant_name="Shell", category="combustible", bank="BBVA", card_network="Visa", payment_type="debit", wallet_required=None, discount_percent=15, cashback_cap=3000, min_purchase=8000, valid_from=date(2026, 4, 1), valid_to=date(2026, 8, 31), weekdays="fri", conditions_text="Tope mensual", source_url="https://example.com/bbva-shell"),
        models.Promotion(title="40% Mostaza con MODO", merchant_name="Mostaza", category="gastronomia", bank=None, card_network=None, payment_type="wallet", wallet_required="MODO", discount_percent=40, cashback_cap=4000, min_purchase=4000, valid_from=date(2026, 4, 1), valid_to=date(2026, 7, 31), weekdays="sat,sun", conditions_text="Válido en locales adheridos", source_url="https://example.com/modo-mostaza"),
        models.Promotion(title="25% Coto Supervielle", merchant_name="Coto", category="supermercado", bank="Supervielle", card_network="Mastercard", payment_type="credit", wallet_required=None, discount_percent=25, cashback_cap=7000, min_purchase=12000, valid_from=date(2026, 4, 1), valid_to=date(2026, 9, 30), weekdays="tue", conditions_text="Segmento sueldo", source_url="https://example.com/supervielle-coto"),
        models.Promotion(title="20% PedidosYa con Mercado Pago", merchant_name="PedidosYa", category="online", bank=None, card_network=None, payment_type="wallet", wallet_required="Mercado Pago", discount_percent=20, cashback_cap=2500, min_purchase=3000, valid_from=date(2026, 4, 1), valid_to=date(2026, 10, 31), weekdays="mon,wed,fri", conditions_text="Pago con dinero en cuenta", source_url="https://example.com/mp-pedidosya"),
        models.Promotion(title="35% Jumbo ICBC Premium", merchant_name="Jumbo", category="supermercado", bank="ICBC", card_network="Visa", payment_type="credit", wallet_required=None, discount_percent=35, cashback_cap=12000, min_purchase=25000, valid_from=date(2026, 4, 1), valid_to=date(2026, 6, 30), weekdays="thu", conditions_text="Solo segmento premium", source_url="https://example.com/icbc-jumbo"),
        models.Promotion(title="18% Adidas Nacion", merchant_name="Adidas", category="indumentaria", bank="Banco Nación", card_network="Mastercard", payment_type="credit", wallet_required=None, discount_percent=18, cashback_cap=None, min_purchase=10000, valid_from=date(2026, 4, 1), valid_to=date(2026, 12, 31), weekdays="sat", conditions_text="Sin tope de reintegro", source_url="https://example.com/nacion-adidas"),
        models.Promotion(title="10% Rappi Amex", merchant_name="Rappi", category="online", bank="American Express", card_network="Amex", payment_type="credit", wallet_required=None, discount_percent=10, cashback_cap=2000, min_purchase=2500, valid_from=date(2026, 4, 1), valid_to=date(2026, 7, 31), weekdays="sun", conditions_text="Solo app móvil", source_url="https://example.com/amex-rappi"),
    ]

    db.add_all(sample_promotions)
    db.commit()
    return {"message": f"Seed completado con {len(sample_promotions)} promociones"}
