from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.product import Product
from app.schemas.common import PaginationMeta
from app.schemas.product import ProductCreate, ProductListResponse, ProductRead, ProductUpdate


class ProductService:
    @staticmethod
    def create_product(db: Session, payload: ProductCreate) -> Product:
        existing = db.execute(select(Product).where(Product.sku == payload.sku)).scalar_one_or_none()
        if existing:
            raise ConflictError("SKU already exists")

        product = Product(
            name=payload.name,
            sku=payload.sku,
            price=payload.price,
            quantity_in_stock=payload.quantity_in_stock,
        )
        db.add(product)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ConflictError("SKU already exists") from exc
        db.refresh(product)
        return product

    @staticmethod
    def list_products(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        search: str | None = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> ProductListResponse:
        query = select(Product)
        count_query = select(func.count()).select_from(Product)

        if search:
            search_term = f"%{search}%"
            filters = or_(Product.name.ilike(search_term), Product.sku.ilike(search_term))
            query = query.where(filters)
            count_query = count_query.where(filters)

        sort_columns = {
            "name": Product.name,
            "sku": Product.sku,
            "price": Product.price,
            "quantity_in_stock": Product.quantity_in_stock,
            "created_at": Product.created_at,
            "updated_at": Product.updated_at,
        }
        sort_column = sort_columns.get(sort_by, Product.created_at)
        query = query.order_by(asc(sort_column) if sort_order.lower() == "asc" else desc(sort_column))
        total = db.scalar(count_query) or 0
        items = db.execute(query.offset((page - 1) * page_size).limit(page_size)).scalars().all()
        return ProductListResponse(
            items=items,
            meta=PaginationMeta(page=page, page_size=page_size, total=total),
        )

    @staticmethod
    def get_product(db: Session, product_id) -> Product:
        product = db.get(Product, product_id)
        if not product:
            raise NotFoundError("Product not found")
        return product

    @staticmethod
    def update_product(db: Session, product_id, payload: ProductUpdate) -> Product:
        product = ProductService.get_product(db, product_id)
        if payload.sku and payload.sku != product.sku:
            existing = db.execute(select(Product).where(Product.sku == payload.sku, Product.id != product.id)).scalar_one_or_none()
            if existing:
                raise ConflictError("SKU already exists")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(product, field, value)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ConflictError("SKU already exists") from exc
        db.refresh(product)
        return product

    @staticmethod
    def delete_product(db: Session, product_id) -> None:
        product = ProductService.get_product(db, product_id)
        db.delete(product)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ConflictError("Product is referenced by existing orders") from exc
