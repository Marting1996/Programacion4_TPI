from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .service import ProductoError, ProductoNoEncontrado, ProductoService
from .unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])

SoloAdmin = [Depends(require_role(["admin"]))]
IdPath = Annotated[int, Path(gt=0, description="ID del producto")]


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ProductoServiceDep = Annotated[ProductoService, Depends(get_producto_service)]

ERRORES_DE_DOMINIO = (ProductoError, CategoriaNoEncontrada)


def _a_http(error: Exception) -> HTTPException:
    if isinstance(error, (ProductoNoEncontrado, CategoriaNoEncontrada)):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))


# ---------------- Públicos ----------------

@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ProductoServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[Optional[str], Query(max_length=100, description="Busca en el nombre")] = None,
    categoria_id: Annotated[Optional[int], Query(gt=0)] = None,
    disponible: Optional[bool] = None,
) -> ProductosPaginados:
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{id}", response_model=ProductoRead)
def detalle_producto(id: IdPath, service: ProductoServiceDep) -> ProductoRead:
    try:
        return service.obtener(id)
    except ERRORES_DE_DOMINIO as error:
        raise _a_http(error)


# ---------------- Solo admin ----------------

@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=SoloAdmin,
)
def crear_producto(data: ProductoCreate, service: ProductoServiceDep) -> ProductoRead:
    try:
        return service.crear(data)
    except ERRORES_DE_DOMINIO as error:
        raise _a_http(error)


@router.put("/{id}", response_model=ProductoRead, dependencies=SoloAdmin)
def actualizar_producto(
    id: IdPath, data: ProductoUpdate, service: ProductoServiceDep
) -> ProductoRead:
    try:
        return service.actualizar(id, data)
    except ERRORES_DE_DOMINIO as error:
        raise _a_http(error)


@router.patch("/{id}/stock", response_model=ProductoRead, dependencies=SoloAdmin)
def actualizar_stock(
    id: IdPath, data: ProductoStockUpdate, service: ProductoServiceDep
) -> ProductoRead:
    try:
        return service.actualizar_stock(id, data)
    except ERRORES_DE_DOMINIO as error:
        raise _a_http(error)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=SoloAdmin)
def eliminar_producto(id: IdPath, service: ProductoServiceDep) -> None:
    try:
        service.eliminar(id)
    except ERRORES_DE_DOMINIO as error:
        raise _a_http(error)