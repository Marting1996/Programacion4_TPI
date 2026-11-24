from typing import Generic, Optional, Sequence, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    
    model: type[T]

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_id(self, id: int, for_update: bool = False) -> Optional[T]:
        return self.session.get(self.model, id, with_for_update=for_update)

    def get_all(self, skip: int = 0, limit: Optional[int] = None) -> Sequence[T]:
        consulta = select(self.model).order_by(self.model.id)  
        consulta = consulta.offset(skip)
        if limit is not None:
            consulta = consulta.limit(limit)
        return self.session.exec(consulta).all()

    def add(self, entity: T) -> T:
      
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        # Borrado físico
        self.session.delete(entity)
        self.session.flush()