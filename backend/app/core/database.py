from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# Conexión a PostgreSQL
engine = create_engine(settings.DATABASE_URL, echo=False, pool_pre_ping=True)


def create_all_tables() -> None:
    # Crea las tablas de todos los modelos importados hasta este momento
    # No modifica tablas que ya existen
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    # Crea una sesión nueva
    return Session(engine)