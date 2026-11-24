from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada
from .models import Producto
from .schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .unit_of_work import ProductoUnitOfWork


# ---------------- Excepciones de dominio ----------------

class ProductoError(Exception):
    pass


class ProductoNoEncontrado(ProductoError):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto {producto_id} no encontrado")


# ---------------- Casos de uso ----------------

class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        skip: int,
        limit: int,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in productos],
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._buscar_activo(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            producto = uow.productos.add(Producto.model_validate(data))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar_activo(uow, producto_id)
            cambios = data.model_dump(exclude_unset=True)
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            return ProductoRead.model_validate(uow.productos.add(producto))

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar_activo(uow, producto_id)
            producto.sqlmodel_update(data.model_dump(exclude_unset=True))
            return ProductoRead.model_validate(uow.productos.add(producto))

    def eliminar(self, producto_id: int) -> None:
        # Baja lógica
        with self.uow as uow:
            producto = self._buscar_activo(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)

    # ---------------- Auxiliares ----------------

    @staticmethod
    def _buscar_activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(producto_id)
        return producto

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        # La categoría tiene que existir y estar activa
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)