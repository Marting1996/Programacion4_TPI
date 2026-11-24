from sqlmodel import SQLModel


class MensajeResponse(SQLModel):
    # Respuesta de login y logout
    message: str