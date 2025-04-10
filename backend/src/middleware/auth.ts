import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('Auth Middleware: No token provided');
      throw new Error('No token');
    }

    const secret = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
    console.log('Auth Middleware: Verifying token with secret:', secret);
    console.log('Auth Middleware: Verifying token:', token);
    const decoded = jwt.verify(token, secret);
    console.log('Auth Middleware: Token decoded:', decoded);
    
    const user = await prisma.user.findUnique({
      where: { id: (decoded as any).id }
    });
    console.log('Auth Middleware: User found:', user ? user.id : 'null');

    if (!user) {
      console.log('Auth Middleware: User not found in DB for decoded ID');
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('Auth Middleware Error:', error.message);
    res.status(401).json({ error: 'Please authenticate' });
  }
}; 