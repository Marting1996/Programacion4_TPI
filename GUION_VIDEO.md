# Guion del video — Food Store (TPI Programación IV)

Duración objetivo: **12 a 13 minutos** (el TP pide entre 10 y 15).
El CE-07 exige: **cámara encendida al inicio, registro, compra como cliente, gestión como admin y cancelación con restitución de stock**. Todo eso está marcado con ✅ abajo.

> Formato: **[HACÉS]** = lo que mostrás en pantalla. **DECÍS:** = texto sugerido (no hace falta leerlo literal).

---

## Antes de grabar (checklist)

- [ ] Base limpia: borrar y recrear `foodstore_db`, después `python -m app.db.seed` (así el stock arranca en los valores del seed).
- [ ] Backend corriendo: `uvicorn app.main:app --reload` (desde `backend`, con el `.venv` activado).
- [ ] Frontend corriendo: `pnpm dev` (desde `frontend`).
- [ ] **Dos ventanas del navegador**: una normal (cliente) y una **de incógnito** (admin). Como la sesión va en una cookie, en la misma ventana no podés tener los dos usuarios a la vez.
- [ ] Carrito vacío en la ventana del cliente.
- [ ] VS Code abierto en la carpeta `TPI` con el árbol de carpetas visible.
- [ ] Datos para el registro ya pensados (ej.: usuario `juanperez`, nombre `Juan Pérez`, email `juan@mail.com`, contraseña que cumpla las reglas).
- [ ] Zoom del navegador al 110–125 % para que se lea bien en el video.

---

## 1. Presentación — 0:00 a 0:45 ✅ cámara encendida

**[HACÉS]** Cámara visible, pantalla con el README abierto de fondo.

**DECÍS:** "Hola, soy [nombre], de la Tecnicatura Universitaria en Programación a Distancia. Les presento mi Trabajo Práctico Integrador de Programación IV: **Food Store**, una tienda de comida online. El backend está hecho con **FastAPI, SQLModel y PostgreSQL**, y el frontend con **React, TypeScript y Vite**, usando TanStack Query, Form y Table, Zustand y Axios. Vamos a ver la arquitectura, un registro, una compra completa, la cancelación con devolución de stock y el panel de administración."

**[HACÉS]** Podés apagar la cámara o dejarla chica en una esquina.

---

## 2. Estructura y arranque — 0:45 a 2:30

**[HACÉS]** En VS Code, desplegá `backend/app`.

**DECÍS:** "El backend está organizado **por dominio**: `auth`, `usuarios`, `categorias`, `productos` y `pedidos`. Cada módulo tiene sus capas: **models, schemas, repository, unit_of_work, service y router**. En `core` está lo compartido: configuración, base de datos, seguridad, el `BaseRepository` genérico y el `UnitOfWork`."

**[HACÉS]** Abrí `backend/app/core/unit_of_work.py` y señalá `__exit__`.

**DECÍS:** "El **Unit of Work** es el único lugar donde se hace el commit: si el bloque `with` termina bien, hace commit; si hubo una excepción, rollback; y siempre cierra la sesión. Los services abren el `with` y los routers nunca tocan la base directamente."

**[HACÉS]** Abrí `http://localhost:8000/docs` y bajá rápido por la lista de endpoints.

**DECÍS:** "Acá está la documentación de Swagger con todos los endpoints bajo `/api/v1`: auth, usuarios, categorías, productos y pedidos. Los datos iniciales los carga el seed, que es idempotente: crea el usuario admin, 4 categorías y 9 productos."

---

## 3. Registro y catálogo — 2:30 a 4:15 ✅ registro

**[HACÉS]** Ventana normal → `http://localhost:5173`. Mostrá el catálogo.

**DECÍS:** "Este es el catálogo público. Tiene **búsqueda con debounce**, **filtro por categoría** y **paginación**; mientras carga se ve un skeleton."

**[HACÉS]**
1. Escribí "pizza" en el buscador → aparecen las 3 pizzas.
2. Escribí algo que no exista (ej. "sushi") → estado vacío.
3. Borrá la búsqueda, filtrá por "Postres", después volvé a "Todas".
4. Pasá a la página 2 y volvé.

**[HACÉS]** Clic en **Registrarse**. Primero mandá el formulario con un error a propósito (ej. contraseñas distintas o email inválido) para mostrar la validación.

**DECÍS:** "Los formularios usan **TanStack Form** con validación en cada campo."

**[HACÉS]** Completá bien el registro y entrá.

**DECÍS:** "Al registrarme quedo logueado. El token JWT viaja en una **cookie HttpOnly**, así que JavaScript no puede leerlo; no se guarda en localStorage."

---

## 4. Compra como cliente — 4:15 a 6:30 ✅ compra

**[HACÉS]** Antes de comprar, en la **ventana de incógnito** logueate como admin (`admin` / `Admin1234!`) → **Admin → Productos**. Señalá el stock de **Pizza Muzzarella (20)** y **Brownie con helado (6)**.

**DECÍS:** "Antes de comprar, miremos el stock desde el panel de admin: la Pizza Muzzarella tiene 20 y el Brownie 6."

**[HACÉS]** Volvé a la ventana del cliente:
1. Agregá **2 Pizza Muzzarella** y **1 Brownie con helado**.
2. Andá al **carrito**, usá los botones + y − para mostrar que cambia el total.
3. **Recargá la página (F5)** → el carrito sigue ahí.

**DECÍS:** "El carrito se guarda con **Zustand y persist**, por eso sobrevive a una recarga."

**[HACÉS]** **Confirmar pedido** → checkout. Probá una dirección muy corta (ej. "abc") para que salte la validación, después completá una dirección válida, elegí forma de pago (EFECTIVO o TRANSFERENCIA) y confirmá.

**DECÍS:** "La dirección tiene que tener entre 5 y 200 caracteres y la forma de pago es efectivo o transferencia; eso lo validan tanto el frontend como el backend."

**[HACÉS]** Te lleva a **Mis pedidos** → abrí el **detalle** del pedido.

**DECÍS:** "El pedido queda en estado **PENDIENTE**. En el detalle se ve que cada línea guarda una **copia del nombre y del precio** del producto al momento de la compra, así si después cambia el precio, el pedido no se altera."

**[HACÉS]** Ventana de incógnito (admin) → recargá **Productos**: Pizza Muzzarella **18**, Brownie **5**.

**DECÍS:** "Y el stock ya se descontó: 20 pasó a 18 y 6 a 5. El descuento se hace **en la misma transacción** que crea el pedido."

---

## 5. Cancelación con restitución de stock — 6:30 a 7:45 ✅ cancelación

**[HACÉS]** Ventana del cliente → **Mis pedidos** → botón **Cancelar** del pedido → confirmar.

**DECÍS:** "Como cliente puedo cancelar mi pedido mientras está **PENDIENTE**. Lo cancelo..."

**[HACÉS]** Ventana de admin → recargá **Productos**: Pizza Muzzarella vuelve a **20** y Brownie a **6**.

**DECÍS:** "...y el stock se **restituye**: vuelve a 20 y a 6. Igual que en la creación, todo pasa en una sola transacción: si algo falla, se hace rollback y no queda el stock a medias."

**[HACÉS]** (Opcional, 20 segundos) En el cliente, intentá comprar más unidades que el stock disponible (ej. 7 Brownies) → se ve el error del backend.

**DECÍS:** "Si pido más de lo que hay, el backend rechaza el pedido entero y no se descuenta nada."

**[HACÉS]** Hacé **un pedido nuevo** (cualquier producto) para usarlo en la parte de admin.

---

## 6. Gestión como admin — 7:45 a 11:15 ✅ gestión como admin

**[HACÉS]** Ventana de admin. Primero mostrá la protección de rutas: en la ventana del **cliente**, escribí `http://localhost:5173/admin` en la barra → te manda a "no autorizado".

**DECÍS:** "Las rutas de admin están protegidas por rol con un `ProtectedRoute`; un cliente no puede entrar. Y el backend también lo valida con `require_role`."

### 6.1 Resumen
**[HACÉS]** **Admin → Resumen**.

**DECÍS:** "El resumen muestra tarjetas con el total de pedidos, cuántos hay en cada estado, los pedidos de hoy y los ingresos de los pedidos entregados."

### 6.2 Pedidos (máquina de estados)
**[HACÉS]** **Admin → Pedidos**. Tomá el pedido nuevo: **Preparar** → pasa a EN_PREPARACION → **Entregar** → pasa a ENTREGADO. Mostrá que ya no tiene botones. Usá el filtro por estado.

**DECÍS:** "Los pedidos siguen una máquina de estados: PENDIENTE puede ir a EN PREPARACIÓN o CANCELADO; EN PREPARACIÓN puede ir a ENTREGADO o CANCELADO; y ENTREGADO y CANCELADO son **terminales**. La interfaz solo ofrece las transiciones válidas, y el backend las vuelve a validar."

**[HACÉS]** Volvé a **Resumen** → los ingresos entregados aumentaron.

### 6.3 Productos
**[HACÉS]** **Admin → Productos**:
1. Mostrá la tabla (TanStack Table): ordená por precio, usá la búsqueda.
2. **Nuevo producto** → creá uno (ej. "Empanada de carne", categoría Pizzas o la que quieras, precio 1200, stock 30).
3. Botón **Stock** sobre ese producto → cambiá el stock y desmarcá "Disponible".
4. **Eliminar** el producto → desaparece.

**DECÍS:** "Esto es el ABM de productos con TanStack Table y Form. El cambio de stock usa un PATCH aparte. Y el borrado es **lógico**: el producto no se elimina de la base, se marca como inactivo, para no romper los pedidos que ya lo tienen."

### 6.4 Categorías
**[HACÉS]** **Admin → Categorías**:
1. **Nueva categoría** → "Empanadas".
2. Intentá crear otra con el nombre "Pizzas" → error **409** en el modal (nombre duplicado).
3. **Editar** "Empanadas" (cambiale la descripción).

**DECÍS:** "El nombre de la categoría es único: si se repite, el backend responde 409 y lo muestro en el formulario."

### 6.5 Usuarios
**[HACÉS]** **Admin → Usuarios**: buscá el usuario que registraste → **Desactivar**. En la ventana del cliente, cerrá sesión e intentá volver a entrar → error "Cuenta de usuario desactivada". Volvé al admin → **Activar** → el cliente ya puede entrar.

**DECÍS:** "El admin puede activar y desactivar usuarios. Un usuario desactivado no puede iniciar sesión. El admin no puede desactivarse a sí mismo: en su fila no aparece el botón."

---

## 7. Un vistazo al código clave — 11:15 a 12:30

**[HACÉS]** Abrí `backend/app/modules/pedidos/service.py`:
- Señalá `TRANSICIONES` (línea ~22).
- Señalá el `for item in sorted(...)` con `get_by_id(..., for_update=True)` (línea ~92).

**DECÍS:** "Acá están las reglas de negocio. `TRANSICIONES` define la máquina de estados. Al crear un pedido, cada producto se lee con **SELECT FOR UPDATE** para bloquear la fila y evitar que dos compras simultáneas vendan el mismo stock; y los recorro **ordenados por id** para evitar deadlocks."

**[HACÉS]** Abrí `frontend/src/shared/api/axiosInstance.ts` y `frontend/src/store/authStore.ts`.

**DECÍS:** "En el frontend, Axios usa `withCredentials` para mandar la cookie, y un interceptor cierra la sesión si el backend devuelve 401. Los datos del servidor se manejan con **TanStack Query**, que invalida el caché después de cada cambio: por eso al cancelar un pedido el stock se actualiza solo. Todo está en **TypeScript estricto, sin `any`**."

---

## 8. Cierre — 12:30 a 13:00

**[HACÉS]** Mostrá el `README.md` de la raíz.

**DECÍS:** "En el README de la raíz están los requisitos, los pasos de instalación del backend y del frontend, las variables de entorno y el usuario admin del seed, junto con el link al repositorio. Eso es todo, ¡muchas gracias!"

---

## Después de grabar

- [ ] Subir el video (YouTube como **no listado** o Drive con acceso público) y pegar el link en `README.md` en lugar de `https://LINK-AL-VIDEO`.
- [ ] Pegar la URL del repo en lugar de `https://github.com/USUARIO/REPOSITORIO`.
- [ ] Este archivo (`GUION_VIDEO.md`) no hace falta entregarlo: podés borrarlo antes de armar el `.zip` y subir al repo.
