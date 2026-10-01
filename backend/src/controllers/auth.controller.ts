import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse, AuthRequest } from '../types/index.js';
import { config } from '../config/env.js';

const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, token } = await AuthService.register(req.body);

    res.cookie(config.tokenKey, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, token } = await AuthService.login(req.body);

    res.cookie(config.tokenKey, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const response: ApiResponse = {
      success: true,
      message: 'User logged in successfully',
      data: {
        user,
        token,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie(config.tokenKey);

    const response: ApiResponse = {
      success: true,
      message: 'User logged out successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const refresh_token = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(501).json({ success: false, message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const result = await AuthService.changePassword(userId, req.body);

    const response: ApiResponse = {
      success: true,
      message: result.message,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export { register, login, refresh_token, logout, changePassword };