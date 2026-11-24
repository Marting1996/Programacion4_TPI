# Food Store — Sistema de pedidos de comida

Trabajo Práctico Integrador — Programación IV — Tecnicatura Universitaria en Programación a Distancia (UTN).

Aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos indicando dirección de entrega y forma de pago. El administrador gestiona categorías, productos, stock, pedidos y usuarios desde un panel.

- **Repositorio:** https://github.com/Marting1996/Programacion4_TPI
- **Video de demostración:** https://drive.google.com/file/d/1mqfw-1GnoDLtAQvodBerrC5VhLANKOPx/view?usp=sharing

## Tecnologías

| Parte | Stack |
|---|---|
| Backend | Python 3.11–3.13, FastAPI, SQLModel, PostgreSQL, JWT en cookie HttpOnly (python-jose), bcrypt (passlib) |
| Frontend | React 19 + TypeScript, Vite, Tailwind CSS 4, TanStack Query, TanStack Form, TanStack Table, React Router 7, Zustand, Axios |

## Requisitos previos

- **Python 3.11, 3.12 o 3.13** (SQLModel no funciona con Python 3.14).
- **PostgreSQL 15 o superior**, en ejecución.
- **Node.js 20.19 o superior** y **pnpm 9 o superior** (`npm install -g pnpm`).

## Estructura del repositorio

```
TPI/
├── backend/    API REST (FastAPI + SQLModel + PostgreSQL)
├── frontend/   Aplicación React + TypeScript (Vite)
└── README.md
```

## Backend

### 1. Crear la base de datos

Crear una base vacía llamada `foodstore_db` (desde pgAdmin o con psql):

```sql
CREATE DATABASE foodstore_db;
```

### 2. Instalar dependencias

Desde la carpeta `backend/`:

```bash
# Windows 
py -3.12 -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Variables de entorno

Copiar `.env.example` como `.env` y completar los valores:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql+psycopg2://postgres:TU_CONTRASEÑA@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres) | Generar con `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión (token y cookie) | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` solo en producción con HTTPS | `false` |

### 4. Cargar los datos iniciales (seed)

```bash
python -m app.db.seed
```

Crea las tablas y carga el usuario administrador, 4 categorías y 9 productos con stock. Es **idempotente**: se puede ejecutar varias veces sin duplicar datos.

### 5. Levantar el servidor

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación Swagger: http://localhost:8000/docs
- Documentación ReDoc: http://localhost:8000/redoc

## Frontend

Desde la carpeta `frontend/`:

### 1. Variables de entorno

Copiar `.env.example` como `.env`:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

### 2. Instalar, compilar y ejecutar

```bash
pnpm install
pnpm build    # verifica los tipos de TypeScript y genera el build
pnpm dev
```

La aplicación queda disponible en http://localhost:5173.

## Usuario administrador (seed)

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |

Los usuarios que se registran desde la aplicación reciben siempre el rol `user` (cliente).

## Funcionalidades

**Cliente (`user`)**
- Registro e inicio de sesión (la sesión viaja en una cookie HttpOnly; el frontend nunca lee ni guarda el token).
- Catálogo paginado con búsqueda por nombre y filtro por categoría.
- Carrito persistido en el navegador.
- Checkout con dirección de entrega, forma de pago (efectivo o transferencia) y notas.
- "Mis pedidos": listado, detalle y cancelación de pedidos en estado `PENDIENTE`.

**Administrador (`admin`)**
- Resumen con indicadores: pedidos por estado, pedidos de hoy e ingresos de pedidos entregados.
- ABM de categorías y productos, con cambio de stock y disponibilidad.
- Gestión de pedidos según la máquina de estados.
- Gestión de usuarios: activar y desactivar.

## Reglas de negocio

- **RN-01:** el pedido se crea en una sola transacción. Cada producto debe existir, estar activo y disponible y tener stock suficiente; el stock se descuenta y cada línea copia el nombre y el precio del producto. Si algo falla, no se guarda nada.
- **RN-02:** máquina de estados `PENDIENTE → EN_PREPARACION → ENTREGADO`, con cancelación desde `PENDIENTE` o `EN_PREPARACION`. `ENTREGADO` y `CANCELADO` son terminales.
- **RN-03:** al cancelar, el stock se restituye en la misma transacción.
- **RN-04:** el cliente solo ve y cancela sus propios pedidos (y solo en `PENDIENTE`); el admin ve todos.
- **RN-05:** las líneas y el total de un pedido no cambian después de creado.
- **RN-06:** forma de pago `EFECTIVO` o `TRANSFERENCIA`; dirección de entrega de 5 a 200 caracteres.

## Arquitectura

**Backend:** un paquete por dominio en `app/modules/` (`auth`, `usuarios`, `categorias`, `productos`, `pedidos`) con la cadena Router → Service → Unit of Work → Repository → Model. El commit ocurre solo en el `__exit__` del Unit of Work; ningún Service ni Router llama a `session.commit()`. La infraestructura compartida vive en `app/core/`.

**Frontend:** organizado por features (`auth`, `categorias`, `productos`, `usuarios`, `pedidos`). TanStack Query gestiona el estado del servidor; Zustand, el estado del cliente (sesión en `authStore` y carrito en `cartStore`, ambos con `persist`). Las rutas de cliente y de administración se protegen con `ProtectedRoute`.