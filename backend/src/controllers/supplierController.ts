import { Request, Response } from 'express';
import { prisma } from '../server';

// Get all suppliers
export const getAllSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        products: true
      }
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single supplier
export const getSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: true
      }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new supplier
export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { name, contactInfo } = req.body;
    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactInfo
      }
    });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a supplier
export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contactInfo } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: {
        name,
        contactInfo
      }
    });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a supplier
export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.supplier.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}; 