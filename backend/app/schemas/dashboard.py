from app.schemas.common import ORMModel
from app.schemas.product import ProductRead


class DashboardStats(ORMModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[ProductRead]
