# TypeScript Express.js API

A modern, well-structured TypeScript Node.js Express.js API with comprehensive tooling and best practices.

## Features

- 🚀 **TypeScript** - Full TypeScript support with strict configuration
- 🔒 **Security** - Helmet, CORS, rate limiting, and input validation
- 📝 **Logging** - Morgan HTTP request logging
- 🔐 **Authentication** - JWT-based authentication with access and refresh tokens
- 🔑 **Password Security** - bcrypt password hashing with salt rounds
- ⏰ **Token Management** - 15-minute access tokens and 7-day refresh tokens
- 🚫 **Token Blacklisting** - Redis-based token revocation and blacklisting
- 📱 **Session Management** - Track and manage user sessions across devices
- 🔄 **Token Refresh** - Secure refresh token rotation
- 🧹 **Automatic Cleanup** - Periodic cleanup of expired tokens

- 🔧 **Development** - Hot reload with nodemon
- 📊 **Health Checks** - Built-in health monitoring endpoint
- 🏗️ **Modular Structure** - Clean separation of concerns
- 📋 **Linting** - ESLint with TypeScript rules
- 🎯 **Error Handling** - Comprehensive error handling middleware

## Project Structure

```
src/
├── middleware/         # Express middleware
├── routes/            # API route handlers
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── index.ts           # Application entry point
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose (for containerized setup)

### Option 1: Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd typescript-express-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Start MongoDB (you'll need MongoDB installed locally):
```bash
# Or use Docker for MongoDB only
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo:7.0
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Option 2: Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd typescript-express-api
```

2. Build and start all services:
```bash
npm run docker:build
npm run docker:up
```

3. View logs:
```bash
npm run docker:logs
```

5. Stop services:
```bash
npm run docker:down
```

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start the production server

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

### Docker
- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start all services with Docker Compose
- `npm run docker:down` - Stop all services

- `npm run docker:logs` - View Docker Compose logs

## API Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /health/ready` - Server readiness check (validates database connection)

### API v1
- `GET /api/v1` - API information
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/signin` - Sign in user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/profile` - Get current user profile (protected)
- `POST /api/v1/auth/signout` - Sign out user (protected)
- `POST /api/v1/auth/signout-all` - Sign out from all devices (protected)
- `GET /api/v1/auth/sessions` - Get user active sessions (protected)
- `DELETE /api/v1/auth/sessions/:sessionId` - Revoke specific session (protected)

## Example API Usage

### Check server readiness
```bash
curl http://localhost:3000/health/ready
```

### Get all users
```bash
curl http://localhost:3000/api/v1/users
```

### Create a new user
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Get user by ID
```bash
curl http://localhost:3000/api/v1/users/1
```

### Register a new user
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'
```

### Sign in user
```bash
curl -X POST http://localhost:3000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

### Get user profile (protected route)
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/api/v1/auth/profile
```

### Refresh access token
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

### Sign out from all devices
```bash
curl -X POST -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/api/v1/auth/signout-all
```

### Get user sessions
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/api/v1/auth/sessions
```

### Revoke specific session
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3000/api/v1/auth/sessions/SESSION_ID
```

## Environment Variables

Create a `.env` file based on `env.example`:

```env
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1
MONGODB_URI=mongodb://localhost:27017/api_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
```

## Development

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Export a router from the file
3. Mount the router in `src/routes/api.ts`

### Adding Middleware

1. Create middleware functions in `src/middleware/`
2. Import and use them in your routes or main app



## Production Deployment

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 