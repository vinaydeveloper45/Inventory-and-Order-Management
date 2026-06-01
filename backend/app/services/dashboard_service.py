from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.dashboard import DashboardStats
from app.schemas.product import ProductRead
from app.core.config import settings


class DashboardService:
    @staticmethod
    def get_stats(db: Session) -> DashboardStats:
        total_products = db.scalar(select(func.count()).select_from(Product)) or 0
        total_customers = db.scalar(select(func.count()).select_from(Customer)) or 0
        total_orders = db.scalar(select(func.count()).select_from(Order)) or 0
        low_stock_products = (
            db.execute(select(Product).where(Product.quantity_in_stock <= settings.low_stock_threshold).order_by(Product.quantity_in_stock.asc()))
            .scalars()
            .all()
        )
        return DashboardStats(
            total_products=total_products,
            total_customers=total_customers,
            total_orders=total_orders,
            low_stock_products=[
                ProductRead.model_validate(product) for product in low_stock_products
            ],
        )
