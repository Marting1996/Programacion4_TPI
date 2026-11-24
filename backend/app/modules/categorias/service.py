from typing import List, Optional

from .models import Categoria
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


# ---------------- Excepciones de dominio ----------------

class CategoriaError(Exception):
    pass


class CategoriaNoEncontrada(CategoriaError):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"Categoría {categoria_id} no encontrada")


class NombreDuplicado(CategoriaError):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


# ---------------- Casos de uso ----------------

class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> List[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._buscar_activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            self._validar_nombre_unico(uow, data.nombre)
            categoria = uow.categorias.add(Categoria.model_validate(data))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._buscar_activa(uow, categoria_id)
            # exclude_unset: solo los campos que vinieron en el JSON
            cambios = data.model_dump(exclude_unset=True)
            if "nombre" in cambios:
                self._validar_nombre_unico(uow, cambios["nombre"], excluir_id=categoria_id)
            categoria.sqlmodel_update(cambios)
            return CategoriaRead.model_validate(uow.categorias.add(categoria))

    def eliminar(self, categoria_id: int) -> None:
        # Baja lógica
        with self.uow as uow:
            categoria = self._buscar_activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    # ---------------- Auxiliares ----------------

    @staticmethod
    def _buscar_activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        # Una categoría dada de baja se trata como inexistente 
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)
        return categoria

    @staticmethod
    def _validar_nombre_unico(
        uow: CategoriaUnitOfWork, nombre: str, excluir_id: Optional[int] = None
    ) -> None:
        existente = uow.categorias.get_by_nombre(nombre)
        if existente is not None and existente.id != excluir_id:
            raise NombreDuplicado(nombre)