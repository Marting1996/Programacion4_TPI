from sqlmodel import Session, select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.db.models import Categoria, Producto, Usuario

# ---------------- Datos iniciales ----------------

ADMIN = {
    "username": "admin",
    "password": "Admin1234!",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.com",
}

CATEGORIAS = [
    ("Pizzas", "Pizzas artesanales con masa fresca"),
    ("Hamburguesas", "Hamburguesas caseras con papas"),
    ("Bebidas", "Gaseosas, aguas y jugos"),
    ("Postres", "Postres caseros"),
]

# (categoria, nombre, descripcion, precio_base, stock)
PRODUCTOS = [
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 8500.0, 20),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 9500.0, 15),
    ("Pizzas", "Pizza Fugazzeta", "Muzzarella y cebolla", 9000.0, 10),
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 7500.0, 25),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Doble carne, doble cheddar y panceta", 10500.0, 12),
    ("Bebidas", "Gaseosa 500 ml", "Línea cola, lima limón o naranja", 2000.0, 50),
    ("Bebidas", "Agua mineral 500 ml", "Con o sin gas", 1500.0, 40),
    ("Postres", "Flan casero", "Con dulce de leche o crema", 3500.0, 8),
    ("Postres", "Brownie con helado", "Brownie tibio con helado de vainilla", 4500.0, 6),
]


def _url_imagen(nombre: str) -> str:
    return f"https://placehold.co/400x300?text={nombre.replace(' ', '+')}"


# ---------------- Carga idempotente ----------------

def _cargar_admin(session: Session) -> None:
    existe = session.exec(
        select(Usuario).where(Usuario.username == ADMIN["username"])
    ).first()
    if existe is not None:
        return
    session.add(
        Usuario(
            username=ADMIN["username"],
            full_name=ADMIN["full_name"],
            email=ADMIN["email"],
            hashed_password=hash_password(ADMIN["password"]),
            role="admin",
        )
    )


def _cargar_categorias(session: Session) -> dict[str, Categoria]:
    categorias: dict[str, Categoria] = {}
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
        categorias[nombre] = categoria
    session.flush()
    return categorias


def _cargar_productos(session: Session, categorias: dict[str, Categoria]) -> None:
    for nombre_categoria, nombre, descripcion, precio, stock in PRODUCTOS:
        existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
        if existe is not None:
            continue
        categoria = categorias[nombre_categoria]
        assert categoria.id is not None
        session.add(
            Producto(
                categoria_id=categoria.id,
                nombre=nombre,
                descripcion=descripcion,
                precio_base=precio,
                imagen_url=_url_imagen(nombre),
                stock=stock,
            )
        )


def cargar_datos_iniciales() -> None:
    with session_factory() as session:
        _cargar_admin(session)
        categorias = _cargar_categorias(session)
        _cargar_productos(session, categorias)
        session.commit()


if __name__ == "__main__":
    # Ejecución: python -m app.db.seed (desde la carpeta backend/)
    create_all_tables()
    cargar_datos_iniciales()
    print("Seed ejecutado: admin, categorías y productos cargados.")