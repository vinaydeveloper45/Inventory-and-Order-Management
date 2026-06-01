from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.customer import Customer
from app.schemas.common import PaginationMeta
from app.schemas.customer import CustomerCreate, CustomerListResponse, CustomerRead


class CustomerService:
    @staticmethod
    def create_customer(db: Session, payload: CustomerCreate) -> Customer:
        existing = db.execute(select(Customer).where(Customer.email == payload.email)).scalar_one_or_none()
        if existing:
            raise ConflictError("Email already exists")

        customer = Customer(
            full_name=payload.full_name,
            email=str(payload.email),
            phone=payload.phone,
        )
        db.add(customer)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ConflictError("Email already exists") from exc
        db.refresh(customer)
        return customer

    @staticmethod
    def list_customers(
        db: Session,
        page: int = 1,
        page_size: int = 20,
        search: str | None = None,
    ) -> CustomerListResponse:
        query = select(Customer)
        count_query = select(func.count()).select_from(Customer)
        if search:
            search_term = f"%{search}%"
            filters = or_(Customer.full_name.ilike(search_term), Customer.email.ilike(search_term), Customer.phone.ilike(search_term))
            query = query.where(filters)
            count_query = count_query.where(filters)
        total = db.scalar(count_query) or 0
        items = db.execute(query.order_by(Customer.created_at.desc()).offset((page - 1) * page_size).limit(page_size)).scalars().all()
        return CustomerListResponse(items=items, meta=PaginationMeta(page=page, page_size=page_size, total=total))

    @staticmethod
    def get_customer(db: Session, customer_id) -> Customer:
        customer = db.get(Customer, customer_id)
        if not customer:
            raise NotFoundError("Customer not found")
        return customer

    @staticmethod
    def delete_customer(db: Session, customer_id) -> None:
        customer = CustomerService.get_customer(db, customer_id)
        db.delete(customer)
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ConflictError("Customer is referenced by existing orders") from exc
