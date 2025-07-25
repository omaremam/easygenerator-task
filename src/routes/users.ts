import { Router, Request, Response } from 'express';

export const usersRouter = Router();

// Mock data - in a real app, this would come from a database
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

// GET /api/v1/users - Get all users
usersRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: users,
    count: users.length,
  });
});

// GET /api/v1/users/:id - Get user by ID
usersRouter.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] || '0');
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'User not found',
      },
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

// POST /api/v1/users - Create new user
usersRouter.post('/', (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Name and email are required',
      },
    });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    data: newUser,
  });
});

// PUT /api/v1/users/:id - Update user
usersRouter.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] || '0');
  const { name, email } = req.body;

  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'User not found',
      },
    });
  }

  users[userIndex] = {
    ...users[userIndex],
    ...(name && { name }),
    ...(email && { email }),
  };

  res.json({
    success: true,
    data: users[userIndex],
  });
});

// DELETE /api/v1/users/:id - Delete user
usersRouter.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params['id'] || '0');
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'User not found',
      },
    });
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  res.json({
    success: true,
    data: deletedUser,
    message: 'User deleted successfully',
  });
}); 