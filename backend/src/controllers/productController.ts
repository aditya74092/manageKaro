import { Request, Response } from 'express';
import { prisma } from '../server';

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        supplier: true
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single product
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        supplier: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, purchaseRate, sellingPrice, stockQuantity, supplierId } = req.body;
    
    // Generate a consistent productId for similar products
    const productId = `${sku.toLowerCase().replace(/\s+/g, '-')}`;

    const product = await prisma.product.create({
      data: {
        productId, // Use generated productId
        name,
        sku,
        purchaseRate,
        sellingPrice,
        stockQuantity,
        supplierId: parseInt(supplierId)
      },
      include: {
        supplier: true
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sku, purchaseRate, sellingPrice, stockQuantity, supplierId } = req.body;
    
    // Generate consistent productId from SKU, same as in createProduct
    const productId = `${sku.toLowerCase().replace(/\s+/g, '-')}`;
    
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        productId, // Update productId along with other fields
        name,
        sku,
        purchaseRate,
        sellingPrice,
        stockQuantity,
        supplierId: parseInt(supplierId)
      },
      include: {
        supplier: true
      }
    });
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update stock quantity
export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;
    
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        stockQuantity: parseInt(stockQuantity)
      },
      include: {
        supplier: true
      }
    });
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get products by productId
export const getProductsByProductId = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const products = await prisma.product.findMany({
      where: { 
        productId: productId 
      },
      include: {
        supplier: true
      },
      orderBy: {
        purchaseRate: 'asc' // Order by price ascending
      }
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'No products found with this productId' });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}; 