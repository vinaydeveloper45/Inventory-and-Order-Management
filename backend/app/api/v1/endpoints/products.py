from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.common import MessageResponse
from app.schemas.product import ProductCreate, ProductListResponse, ProductRead, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    return ProductService.create_product(db, payload)


@router.get("", response_model=ProductListResponse)
def list_products(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
):
    return ProductService.list_products(db, page=page, page_size=page_size, search=search, sort_by=sort_by, sort_order=sort_order)


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: UUID, db: Session = Depends(get_db)):
    return ProductService.get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductRead)
def update_product(product_id: UUID, payload: ProductUpdate, db: Session = Depends(get_db)):
    return ProductService.update_product(db, product_id, payload)


@router.delete("/{product_id}", response_model=MessageResponse)
def delete_product(product_id: UUID, db: Session = Depends(get_db)):
    ProductService.delete_product(db, product_id)
    return MessageResponse(message="Product deleted successfully")
