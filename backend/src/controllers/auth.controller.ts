import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { ApiResponse, AuthRequest } from '../types/index.js';
import { config } from '../config/env.js';
import { CacheService } from '../services/cache.service.js';

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
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies) {
      token = req.cookies[config.tokenKey] || req.cookies['token'];
    }

    const authReq = req as AuthRequest;
    if (authReq.user?.id) {
      await CacheService.invalidateUserSession(authReq.user.id);
    }

    if (token) {
      // Blacklist token in Redis for 7 days
      await CacheService.blacklistToken(token, 7 * 24 * 3600);
    }

    res.clearCookie(config.tokenKey);
    res.clearCookie('token');

    const response: ApiResponse = {
      success: true,
      message: 'User logged out successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const refresh_token = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const token = (await import('jsonwebtoken')).default.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as import('jsonwebtoken').SignOptions
    );

    await CacheService.saveUserSession(user.id, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: true,
    });

    res.cookie(config.tokenKey, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token, user },
    });
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