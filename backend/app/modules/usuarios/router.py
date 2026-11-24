from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.deps import AdminUser, require_role
from .schemas import UserPublic
from .service import UsuarioError, UsuarioNoEncontrado, UsuarioService
from .unit_of_work import UsuarioUnitOfWork

# Todos los endpoints del router exigen rol admin
router = APIRouter(
    prefix="/admin/usuarios",
    tags=["usuarios"],
    dependencies=[Depends(require_role(["admin"]))],
)

IdPath = Annotated[int, Path(gt=0, description="ID del usuario")]


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


UsuarioServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


def _a_http(error: UsuarioError) -> HTTPException:
    if isinstance(error, UsuarioNoEncontrado):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))


@router.get("", response_model=List[UserPublic])
def listar_usuarios(service: UsuarioServiceDep) -> List[UserPublic]:
    return service.listar()


@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(id: IdPath, service: UsuarioServiceDep) -> UserPublic:
    try:
        return service.activar(id)
    except UsuarioError as error:
        raise _a_http(error)


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(id: IdPath, admin: AdminUser, service: UsuarioServiceDep) -> UserPublic:
    try:
        return service.desactivar(id, admin_id=admin.id)
    except UsuarioError as error:
        raise _a_http(error)