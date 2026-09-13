# Ranking Gourmet

Ranking Gourmet es una aplicación web para registrar experiencias gastronómicas y construir un ranking colaborativo de restaurantes. Cada visita puede recibir evaluaciones de distintos usuarios en cinco categorías: comida, bebidas, servicio, relación precio/calidad y ambiente.

La aplicación calcula un promedio por evaluación, por visita y por restaurante. El listado principal permite buscar restaurantes y ordenarlos por puntaje, fecha de visita o nombre.

## Funcionalidades

- Inicio de sesión con email y contraseña.
- Inicio de sesión passwordless con llaves de acceso (passkeys) creadas por usuarios ya autenticados.
- Alta y administración de restaurantes, con dirección, ciudad y etiquetas.
- Registro de visitas a cada restaurante.
- Evaluaciones por comida, bebidas, servicio, valor percibido y ambiente.
- Ranking general calculado a partir de las evaluaciones de cada visita.
- Búsqueda y ordenamiento de restaurantes.
- Perfil de usuario y preferencia de orden predeterminada.
- Rol administrador para crear nuevos usuarios evaluadores.
- API REST documentada con Swagger.

## Arquitectura

El repositorio es un monorepo con dos aplicaciones y una base de datos PostgreSQL:

```text
ranking-gourmet/
├── apps/
│   ├── frontend/        # Aplicación web Next.js
│   └── backend/         # API REST Express + Prisma
├── infrastructure/      # Documentación y variables para Vercel
├── docker-compose.yml   # Entorno completo con Docker
└── package.json         # Scripts del monorepo
```

| Componente | Tecnologías | Puerto local |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS | `8080` con Docker / `3001` manual |
| Backend | Node.js, Express 5, TypeScript, Better Auth, Prisma | `3000` |
| Base de datos | PostgreSQL 16 | `5432` |

El frontend utiliza rutas API internas como proxy hacia el backend. El backend protege los recursos de restaurantes, visitas, evaluadores y evaluaciones mediante sesiones de Better Auth.

Las llaves de acceso se administran únicamente desde la página Cuenta. El login público permite usar una llave existente, pero no crear usuarios ni registrar nuevas llaves. En producción, `FRONTEND_URL` debe coincidir exactamente con el origen HTTPS público desde el que los usuarios abren la aplicación, porque WebAuthn vincula cada llave a ese dominio.

## Modelo de datos

- **Restaurant:** datos del restaurante y sus etiquetas.
- **Visit:** una visita realizada a un restaurante en una fecha determinada.
- **Review:** puntajes asignados por un evaluador a una visita.
- **Reviewer:** perfil evaluador asociado a un usuario autenticado.
- **User, Session y Account:** autenticación y autorización administradas por Better Auth.

## Requisitos

Para ejecutar todo con Docker:

- Docker y Docker Compose.

Para desarrollo manual:

- Node.js 22 o superior.
- npm.
- PostgreSQL 16 o una instancia compatible.

## Inicio rápido con Docker

1. Crear un archivo `.env` en la raíz:

```dotenv
PORT=3000
POSTGRES_USER=ranking_gourmet
POSTGRES_PASSWORD=change-me
POSTGRES_DB=ranking_gourmet

BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters
BETTER_AUTH_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:8080

BACKEND_API_URL=http://backend:3000
BETTER_AUTH_BACKEND_URL=http://backend:3000/api/auth
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3000

INITIAL_USER_EMAIL=admin@example.com
INITIAL_USER_PASSWORD=replace-with-a-strong-password
INITIAL_USER_NAME=Admin
INITIAL_USER_SURNAME=User
INITIAL_USER_ROLE=admin
```

Se puede generar un secreto seguro con:

```bash
openssl rand -base64 32
```

2. Construir los servicios, iniciar PostgreSQL y aplicar las migraciones:

```bash
docker compose build
docker compose up -d db
docker compose run --rm backend npm run db:migrate:deploy
```

3. Iniciar la aplicación:

```bash
docker compose up -d
```

4. Abrir:

- Aplicación: [http://localhost:8080](http://localhost:8080)
- API: [http://localhost:3000](http://localhost:3000)
- Swagger: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

Para detener los servicios:

```bash
docker compose down
```

El volumen de PostgreSQL se conserva al detener los contenedores. El usuario configurado con `INITIAL_USER_*` se crea al iniciar el backend si todavía no existe; después del primer arranque se pueden retirar esas credenciales del entorno.

## Desarrollo manual

1. Instalar las dependencias de cada aplicación:

```bash
npm --prefix apps/backend ci
npm --prefix apps/frontend ci
```

2. Iniciar solamente PostgreSQL con Docker:

```bash
docker compose up -d db
```

3. Crear `apps/backend/.env`:

```dotenv
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://ranking_gourmet:change-me@localhost:5432/ranking_gourmet
BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters
BETTER_AUTH_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

INITIAL_USER_EMAIL=admin@example.com
INITIAL_USER_PASSWORD=replace-with-a-strong-password
INITIAL_USER_NAME=Admin
INITIAL_USER_SURNAME=User
INITIAL_USER_ROLE=admin
```

4. Crear `apps/frontend/.env.local`:

```dotenv
BACKEND_API_URL=http://localhost:3000
BETTER_AUTH_BACKEND_URL=http://localhost:3000/api/auth
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_AUTH_URL=/api/auth
```

5. Aplicar las migraciones:

```bash
npm --prefix apps/backend run db:migrate:deploy
```

6. Iniciar backend y frontend en terminales separadas:

```bash
npm run backend:dev
```

```bash
npm --prefix apps/frontend run dev -- -p 3001
```

La aplicación estará disponible en [http://localhost:3001](http://localhost:3001).

## Scripts principales

Ejecutados desde la raíz del repositorio:

| Comando | Descripción |
| --- | --- |
| `npm run backend:dev` | Inicia la API con recarga automática. |
| `npm run backend:build` | Genera el cliente Prisma y compila el backend. |
| `npm run backend:start` | Inicia el backend compilado. |
| `npm run frontend:dev` | Inicia el servidor de desarrollo de Next.js. |
| `npm run frontend:build` | Genera el build de producción del frontend. |
| `npm run frontend:lint` | Ejecuta ESLint sobre el frontend. |

## API

Los recursos principales están disponibles bajo:

- `/api/restaurants`
- `/api/visits`
- `/api/reviews`
- `/api/reviewers`
- `/api/auth`

La especificación OpenAPI puede consultarse en `/api-docs.json` y su interfaz Swagger en `/api-docs`.

## Despliegue

El proyecto está preparado para desplegar frontend y backend como proyectos independientes de Vercel. La guía de configuración, variables de entorno y despliegue por tags se encuentra en [`infrastructure/vercel.md`](infrastructure/vercel.md).
