from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class UserBase(BaseModel):
    email: str
    name: str


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    id: int

    class Config:
        from_attributes = True


class PaymentMethodBase(BaseModel):
    bank: str
    card_network: Optional[str] = None
    type: str
    wallet_name: Optional[str] = None
    segment: str = "normal"
    active: bool = True


class PaymentMethodCreate(PaymentMethodBase):
    user_id: int


class PaymentMethodRead(PaymentMethodBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class PromotionBase(BaseModel):
    title: str
    merchant_name: Optional[str] = None
    category: str
    bank: Optional[str] = None
    card_network: Optional[str] = None
    payment_type: Optional[str] = None
    wallet_required: Optional[str] = None
    discount_percent: float = Field(ge=0)
    cashback_cap: Optional[float] = Field(default=None, ge=0)
    min_purchase: Optional[float] = Field(default=None, ge=0)
    valid_from: date
    valid_to: date
    weekdays: Optional[str] = None
    conditions_text: Optional[str] = None
    source_url: Optional[str] = None


class PromotionCreate(PromotionBase):
    pass


class PromotionRead(PromotionBase):
    id: int

    class Config:
        from_attributes = True


class PurchaseSimulationIn(BaseModel):
    user_id: int
    merchant_name: str
    category: str
    amount: float = Field(gt=0)
    date: date


class RecommendationRow(BaseModel):
    payment_method_id: int
    payment_label: str
    promotion_title: str
    saving: float
    final_price: float
    reason: str


class RecommendationResponse(BaseModel):
    best_option: Optional[RecommendationRow] = None
    ranking: list[RecommendationRow]
