from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import AdminUser, CurrentUser
from app.modules.productos.service import ProductoNoEncontrado
from .schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from .service import PedidoAjeno, PedidoError, PedidoNoEncontrado, PedidoService
from .unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

IdPath = Annotated[int, Path(gt=0, description="ID del pedido")]


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


PedidoServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]

ERRORES_DE_DOMINIO = (PedidoError, ProductoNoEncontrado)


def _a_http(error: Exception) -> HTTPException:
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    if isinstance(error, PedidoAjeno):
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(error))
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, usuario: CurrentUser, service: PedidoServiceDep) -> PedidoRead:
    try:
        return service.crear(data, usuario_id=usuario.id)
    except ERRORES_DE_DOMINIO as error:
        raise _a_http(error)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: CurrentUser,
    service: PedidoServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Optional[EstadoPedido] = None,
) -> PedidosPaginados:
    return service.listar(
        usuario_id=usuario.id,
        es_admin=usuario.role == "admin",
        skip=skip,
        limit=limit,
        estado=estado,
    )


@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: AdminUser, service: PedidoServiceDep) -> ResumenPedidos:
    return service.resumen()


@router.get("/{id}", response_model=PedidoRead)
def detalle_pedido(id: IdPath, usuario: CurrentUser, service: PedidoServiceDep) -> PedidoRead:
    try:
        return service.obtener(id, usuario_id=usuario.id, es_admin=usuario.role == "admin")
    except ERRORES_DE_DOMINIO as error:
        raise _a_http(error)


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado(
    id: IdPath, data: CambioEstado, _admin: AdminUser, service: PedidoServiceDep
) -> PedidoRead:
    try:
        return service.cambiar_estado(id, data)
    except ERRORES_DE_DOMINIO as error:
        raise _a_http(error)


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(id: IdPath, usuario: CurrentUser, service: PedidoServiceDep) -> PedidoRead:
    try:
        return service.cancelar(id, usuario_id=usuario.id)
    except ERRORES_DE_DOMINIO as error:
        raise _a_http(error)