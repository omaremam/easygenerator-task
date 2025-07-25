# TypeScript Express.js API

A modern, well-structured TypeScript Node.js Express.js API with comprehensive tooling and best practices.

## Features

- 🚀 **TypeScript** - Full TypeScript support with strict configuration
- 🔒 **Security** - Helmet, CORS, rate limiting, and input validation
- 📝 **Logging** - Morgan HTTP request logging
- 🧪 **Testing** - Jest testing framework with supertest
- 🔧 **Development** - Hot reload with nodemon
- 📊 **Health Checks** - Built-in health monitoring endpoint
- 🏗️ **Modular Structure** - Clean separation of concerns
- 📋 **Linting** - ESLint with TypeScript rules
- 🎯 **Error Handling** - Comprehensive error handling middleware

## Project Structure

```
src/
├── __tests__/          # Test files
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

### Installation

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

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## API Endpoints

### Health Check
- `GET /health` - Server health status

### API v1
- `GET /api/v1` - API information
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## Example API Usage

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

### Testing

The project uses Jest for testing. Test files should be placed in `src/__tests__/` and follow the naming convention `*.test.ts`.

Run tests:
```bash
npm test
```

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
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details 