# RouteWerk

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

RouteWerk is a logistics management web application built as a graduation project for Coyotiv School of Software Engineering. It helps logistics companies manage customers, employees, orders, vehicles, and delivery tours from a single platform.

The application supports three main user roles:

- **Admin**: manages logistics companies, customers, employees, and orders across the system.
- **Employee / Dispatcher**: manages company-specific customers, employees, orders, vehicles, and tours.
- **Customer**: creates and tracks orders, including AI-assisted order creation from natural language prompts.

## Features

- Session-based authentication with Passport.
- Role-based access control for admin, employee, and customer workflows.
- Admin dashboard for managing companies, customers, employees, and orders.
- Company dashboard with customer, employee, order, vehicle, and tour management.
- Customer order creation and order tracking.
- AI-assisted order generation using the OpenAI API.
- Vehicle and tour management for dispatching workflows.
- Real-time order updates and notifications using Socket.IO.
- Request validation, rate limiting, security headers, and MongoDB query sanitization.
- PlantUML architecture diagrams for the backend, frontend, API routes, domain model, and AI order flow.

## Tech Stack

**Frontend**

- Vue 3
- Vite
- Pinia
- Vue Router
- Axios
- Socket.IO client
- Sass

**Backend**

- Node.js
- Express
- MongoDB
- Mongoose
- Passport and passport-local-mongoose
- express-session and connect-mongo
- Celebrate / Joi validation
- Socket.IO
- OpenAI API

**Development and Tooling**

- Docker and Docker Compose
- Jest and Supertest
- Vitest
- ESLint and Prettier
- PlantUML

## Architecture

RouteWerk is split into a Vue frontend, an Express API, and a MongoDB database.

The frontend communicates with the backend through REST endpoints and keeps sessions with `withCredentials`. Real-time updates are handled through Socket.IO. The backend stores sessions in MongoDB, uses Passport for authentication, and organizes business logic through manager modules.

Architecture diagrams are available in the [`architecture`](./architecture) folder:

- [`component.puml`](./architecture/component.puml): deployment and backend component overview.
- [`class.puml`](./architecture/class.puml): domain model and relationships.
- [`api-routes.puml`](./architecture/api-routes.puml): REST API route overview.
- [`frontend.puml`](./architecture/frontend.puml): frontend views, components, and stores.
- [`sequence-order-ai.puml`](./architecture/sequence-order-ai.puml): AI-assisted order creation sequence.

## Project Structure

```text
.
├── architecture/              # PlantUML architecture diagrams
├── backend/
│   ├── bin/                   # Backend entrypoint and admin seed script
│   ├── src/
│   │   ├── lib/               # Shared helpers, validation, errors, AI order generation
│   │   ├── managers/          # Business logic layer
│   │   ├── middlewares/       # Auth, access control, API error handling
│   │   ├── models/            # Mongoose models and embedded schemas
│   │   ├── routes/            # Express routes and route validations
│   │   └── views/             # Pug views for fallback pages
│   └── tests/                 # Backend tests
├── frontend/
│   ├── public/                # Static assets
│   └── src/
│       ├── components/        # Vue components
│       ├── router/            # Vue Router setup and guards
│       ├── stores/            # Pinia stores
│       ├── utils/             # Frontend helper functions
│       └── views/             # Page-level Vue views
└── docker-compose.yml
```

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- Docker and Docker Compose
- MongoDB, if running without Docker
- OpenAI API key, if using AI-assisted order generation

## Environment Variables

Create local environment files from the examples:

```sh
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Backend variables:

```env
MONGODB_CONNECTION_STRING=mongodb://mongodb:27017/routewerk
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=your-openai-key-here
NODE_ENV=development
SESSION_SECRET=change-me-to-a-long-random-string
MAX_FAILED_LOGIN_ATTEMPTS=3
LOGIN_LOCK_TIME_MINUTES=15
LOGIN_RATE_LIMIT_MAX=20
AI_GENERATE_RATE_LIMIT_MAX=10
```

Frontend variables:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Do not commit real API keys, production database URLs, passwords, or session secrets. Keep real credentials only in local `.env` files or secret management tools.

## Running with Docker

From the project root:

```sh
docker compose up --build
```

The application will be available at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

## Running Locally

Install dependencies:

```sh
cd backend
npm install

cd ../frontend
npm install
```

Start MongoDB locally or use Docker for MongoDB. If you run the backend directly on your machine, set the backend MongoDB connection string to a local URI, for example:

```env
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/routewerk
```

Start the backend:

```sh
cd backend
npm run dev
```

Start the frontend in another terminal:

```sh
cd frontend
npm run dev
```

## Admin Seed

The project includes a seed script for creating an initial admin account.

Create `secrets/admin.env`:

```env
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change-this-password
SEED_MONGODB_URI=mongodb://localhost:27017/routewerk
```

Then run:

```sh
cd backend
npm run seed:admin
```

Do not use real production credentials in documentation or committed files.

## Testing

Run backend tests:

```sh
cd backend
npm test
```

Run backend coverage:

```sh
cd backend
npm run test:coverage
```

Run frontend unit tests:

```sh
cd frontend
npm run test:unit
```

Run frontend linting:

```sh
cd frontend
npm run lint
```

## API Overview

The backend API is organized around the following route groups:

- `/accounts`: registration, login, logout, and session lookup.
- `/admin`: system-wide company, customer, employee, and order management.
- `/companies`: public company lookup and company-scoped management.
- `/customers`: customer profile, order creation, AI generation, and order access.
- `/orders`: order detail, update, and cargo lookup.
- `/vehicles`: vehicle detail access.
- `/tours`: tour detail, tour cargos, and vehicle assignment.
- `/employees`: employee detail access.

More detail is available in [`architecture/api-routes.puml`](./architecture/api-routes.puml).

## Security Notes

RouteWerk includes several security-focused mechanisms:

- Session cookies are HTTP-only.
- Sessions are stored in MongoDB.
- CORS is configured with credentials support.
- Helmet is used for security headers.
- MongoDB query sanitization is enabled.
- Login and AI generation endpoints are rate-limited.
- Access to company, customer, employee, order, vehicle, and tour resources is checked through middleware.
- Sensitive account fields are removed from JSON output.

## Future Improvements

- Add route optimization and map integration.
- Add email notifications for important order changes.
- Add analytics for dispatchers and admins.
- Improve production deployment configuration.
- Add more advanced vehicle capacity planning.

## Author

Created by Akin Karadag as a graduation project for Coyotiv School of Software Engineering.

## License

This project is licensed under the MIT License. See [`LICENSE`](./LICENSE) for details.
