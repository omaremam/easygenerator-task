# TypeScript Express.js API

A modern, well-structured TypeScript Node.js Express.js API with comprehensive tooling and best practices.

## Features

- 🚀 **TypeScript** - Full TypeScript support with strict configuration
- 🔒 **Security** - Helmet, CORS, rate limiting, and input validation
- 📝 **Logging** - Morgan HTTP request logging

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

## Environment Variables

Create a `.env` file based on `env.example`:

```env
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1
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