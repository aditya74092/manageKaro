import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, shopName, contactInfo } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        shopName,
        contactInfo
      }
    });

    // Generate token
    const secret = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
    console.log('[Register] Signing token with secret:', secret);
    const token = jwt.sign(
      { id: user.id },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        shopName: user.shopName,
        contactInfo: user.contactInfo
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const secret = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
    console.log('[Login] Signing token with secret:', secret);
    const token = jwt.sign(
      { id: user.id },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        shopName: user.shopName,
        contactInfo: user.contactInfo
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id },
      select: {
        id: true,
        email: true,
        name: true,
        shopName: true,
        contactInfo: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}; 