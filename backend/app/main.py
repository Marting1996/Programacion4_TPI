from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
import app.db.models  
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Food Store API",
        description="TPI Programación IV - FastAPI + SQLModel + JWT en cookie HttpOnly",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS con credenciales
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_ORIGIN],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers de cada módulo, todos bajo /api/v1
    app.include_router(auth_router, prefix=API_PREFIX)
    app.include_router(usuarios_router, prefix=API_PREFIX)
    # Routers de cada módulo, todos bajo /api/v1
    app.include_router(auth_router, prefix=API_PREFIX)
    app.include_router(usuarios_router, prefix=API_PREFIX)
    app.include_router(categorias_router, prefix=API_PREFIX)
    app.include_router(productos_router, prefix=API_PREFIX)
    app.include_router(productos_router, prefix=API_PREFIX)
    app.include_router(pedidos_router, prefix=API_PREFIX)

    @app.get("/", tags=["salud"])
    def raiz() -> dict[str, str]:
        return {"mensaje": "Food Store API funcionando. Documentación en /docs"}

    return app


app = create_app()