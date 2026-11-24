from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.deps import require_role
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .service import CategoriaError, CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from .unit_of_work import CategoriaUnitOfWork

# Sin dependencias 
router = APIRouter(prefix="/categorias", tags=["categorias"])

SoloAdmin = [Depends(require_role(["admin"]))]
IdPath = Annotated[int, Path(gt=0, description="ID de la categoría")]


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


CategoriaServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


def _a_http(error: CategoriaError) -> HTTPException:
    if isinstance(error, CategoriaNoEncontrada):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    if isinstance(error, NombreDuplicado):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))


# ---------------- Públicos ----------------

@router.get("", response_model=List[CategoriaRead])
def listar_categorias(service: CategoriaServiceDep) -> List[CategoriaRead]:
    return service.listar()


@router.get("/{id}", response_model=CategoriaRead)
def detalle_categoria(id: IdPath, service: CategoriaServiceDep) -> CategoriaRead:
    try:
        return service.obtener(id)
    except CategoriaError as error:
        raise _a_http(error)


# ---------------- Solo admin ----------------

@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=SoloAdmin,
)
def crear_categoria(data: CategoriaCreate, service: CategoriaServiceDep) -> CategoriaRead:
    try:
        return service.crear(data)
    except CategoriaError as error:
        raise _a_http(error)


@router.put("/{id}", response_model=CategoriaRead, dependencies=SoloAdmin)
def actualizar_categoria(
    id: IdPath, data: CategoriaUpdate, service: CategoriaServiceDep
) -> CategoriaRead:
    try:
        return service.actualizar(id, data)
    except CategoriaError as error:
        raise _a_http(error)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=SoloAdmin)
def eliminar_categoria(id: IdPath, service: CategoriaServiceDep) -> None:
    try:
        service.eliminar(id)
    except CategoriaError as error:
        raise _a_http(error)