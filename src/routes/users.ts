import { Router, Request, Response } from 'express';
import User from '../models/User';

export const usersRouter = Router();

// GET /api/v1/users - Get all users
usersRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch users',
      },
    });
  }
});

// GET /api/v1/users/:id - Get user by ID
usersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params['id']);
    
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch user',
      },
    });
  }
});

// POST /api/v1/users - Create new user
usersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Name and email are required',
        },
      });
    }

    const newUser = new User({ name, email });
    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      data: savedUser,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email already exists',
        },
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create user',
      },
    });
  }
});

// PUT /api/v1/users/:id - Update user
usersRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      req.params['id'],
      updateData,
      { new: true, runValidators: true }
    );

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
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email already exists',
        },
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update user',
      },
    });
  }
});

// DELETE /api/v1/users/:id - Delete user
usersRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params['id']);

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
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete user',
      },
    });
  }
}); 