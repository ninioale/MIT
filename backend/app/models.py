from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)

    payment_methods = relationship("PaymentMethod", back_populates="user", cascade="all, delete")


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bank = Column(String(80), nullable=False)
    card_network = Column(String(40), nullable=True)
    type = Column(String(20), nullable=False)
    wallet_name = Column(String(80), nullable=True)
    segment = Column(String(40), nullable=False, default="normal")
    active = Column(Boolean, nullable=False, default=True)

    user = relationship("User", back_populates="payment_methods")


class Promotion(Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(180), nullable=False)
    merchant_name = Column(String(120), nullable=True)
    category = Column(String(40), nullable=False)
    bank = Column(String(80), nullable=True)
    card_network = Column(String(40), nullable=True)
    payment_type = Column(String(20), nullable=True)
    wallet_required = Column(String(80), nullable=True)
    discount_percent = Column(Float, nullable=False)
    cashback_cap = Column(Float, nullable=True)
    min_purchase = Column(Float, nullable=True)
    valid_from = Column(Date, nullable=False)
    valid_to = Column(Date, nullable=False)
    weekdays = Column(String(40), nullable=True)
    conditions_text = Column(Text, nullable=True)
    source_url = Column(String(255), nullable=True)


class PurchaseSimulation(Base):
    __tablename__ = "purchase_simulations"

    id = Column(Integer, primary_key=True, index=True)
    merchant_name = Column(String(120), nullable=False)
    category = Column(String(40), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
