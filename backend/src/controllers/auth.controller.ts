import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../types/index.js';
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

const refresh_token = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(501).json({ success: false, message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
    res.clearCookie(config.tokenKey, cookieOptions);
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export { register, login, refresh_token, logout };