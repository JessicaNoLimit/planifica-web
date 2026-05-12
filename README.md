# Planifica

Base de proyecto web para una aplicacion de productividad personal con React, Vite, Node.js, Express y MySQL.

## Estructura

```txt
PLANIFICA/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      app.js
      server.js
  frontend/
    src/
      api/
      components/
      context/
      pages/
      styles/
  database/
    schema.sql
```

## Base de datos

1. Crea la base de datos y tablas ejecutando `database/schema.sql` en MySQL.
2. Copia `backend/.env.example` a `backend/.env` y ajusta credenciales.

## Backend

```bash
cd backend
npm install
npm run dev
```

La API queda disponible en `http://localhost:4000/api`.

Endpoints principales:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET|POST /api/tasks`
- `GET|PUT|DELETE /api/tasks/:id`
- `GET|POST /api/appointments`
- `GET|PUT|DELETE /api/appointments/:id`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

La app se abre en `http://localhost:5173`.

Si cambias la URL del backend, copia `frontend/.env.example` a `frontend/.env` y ajusta `VITE_API_URL`.

## Seguridad Basica Implementada

- Helmet para endurecer cabeceras HTTP del backend.
- CORS restringido mediante `CORS_ORIGIN` con compatibilidad hacia `FRONTEND_URL`.
- Rate limit general aplicado sobre `/api`.
- Rate limit especifico en auth para login, registro y recuperacion/reset de contrasena.
