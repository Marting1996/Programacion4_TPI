from datetime import datetime
from typing import Optional

from app.modules.productos.service import ProductoNoEncontrado
from .models import DetallePedido, Pedido
from .schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from .unit_of_work import PedidoUnitOfWork

# ---------------- Máquina de estados  ----------------

PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"

TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


# ---------------- Excepciones de dominio ----------------

class PedidoError(Exception):
    pass


class PedidoNoEncontrado(PedidoError):
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"Pedido {pedido_id} no encontrado")


class PedidoAjeno(PedidoError):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ProductoRepetido(PedidoError):
    def __init__(self) -> None:
        super().__init__("Un producto no puede repetirse en el pedido")


class ProductoNoDisponible(PedidoError):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(PedidoError):
    def __init__(self, nombre: str, disponible: int, pedido: int) -> None:
        super().__init__(
            f"Stock insuficiente para '{nombre}': hay {disponible} y se pidieron {pedido}"
        )


class TransicionInvalida(PedidoError):
    pass


# ---------------- Casos de uso ----------------

class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido()

            # El pedido nace en PENDIENTE 
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=PENDIENTE,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )

            total = 0.0
            for item in sorted(data.items, key=lambda i: i.producto_id):
                producto = uow.productos.get_by_id(item.producto_id, for_update=True)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(
                    DetallePedido(
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self,
        usuario_id: int,
        es_admin: bool,
        skip: int,
        limit: int,
        estado: Optional[str] = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                usuario_id=None if es_admin else usuario_id,
                skip=skip,
                limit=limit,
                estado=estado,
            )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            self._verificar_dueno(pedido, usuario_id, es_admin)
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id, for_update=True)
            self._aplicar_transicion(uow, pedido, data.estado)
            return PedidoRead.model_validate(uow.pedidos.add(pedido))

    def cancelar(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id, for_update=True)
            self._verificar_dueno(pedido, usuario_id, es_admin=False)
            if pedido.estado != PENDIENTE:
                raise TransicionInvalida(
                    f"Solo se pueden cancelar pedidos en {PENDIENTE}; "
                    f"este está en {pedido.estado}"
                )
            self._aplicar_transicion(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(uow.pedidos.add(pedido))

    # Indicadores del panel de administración
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_hoy = datetime.now().astimezone().replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            return ResumenPedidos(
                pendientes=conteos.get(PENDIENTE, 0),
                en_preparacion=conteos.get(EN_PREPARACION, 0),
                entregados=conteos.get(ENTREGADO, 0),
                cancelados=conteos.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_by_estado(ENTREGADO), 2),
            )

    # ---------------- Auxiliares ----------------

    @staticmethod
    def _buscar(uow: PedidoUnitOfWork, pedido_id: int, for_update: bool = False) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id, for_update=for_update)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _verificar_dueno(pedido: Pedido, usuario_id: int, es_admin: bool) -> None:
        if not es_admin and pedido.usuario_id != usuario_id:
            raise PedidoAjeno()

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        if nuevo_estado not in TRANSICIONES[pedido.estado]:
            raise TransicionInvalida(
                f"Transición inválida: {pedido.estado} -> {nuevo_estado}"
            )
        if nuevo_estado == CANCELADO:
            
            for item in pedido.items:
                producto = uow.productos.get_by_id(item.producto_id, for_update=True)
                if producto is not None:
                    producto.stock += item.cantidad
        pedido.estado = nuevo_estado