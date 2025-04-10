import { Request, Response } from 'express';
import { prisma } from '../server';

// Get all transactions
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            shopName: true
          }
        },
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single transaction
export const getTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            shopName: true
          }
        },
        product: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create a new transaction
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { productId: requestedProductId, quantity: requestedQuantity, discount } = req.body;
    const userId = (req as any).user.id;
    
    // Parse inputs to ensure correct types
    const parsedProductId = parseInt(requestedProductId);
    const parsedQuantity = parseInt(requestedQuantity);
    const parsedDiscount = parseFloat(discount || 0);

    // Get the specific product to retrieve its productId (SKU)
    const specificProduct = await prisma.product.findUnique({
      where: { id: parsedProductId }
    });

    if (!specificProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get all products with the same productId (SKU) to calculate total available stock
    const relatedProducts = await prisma.product.findMany({
      where: { 
        productId: { 
          equals: specificProduct.productId 
        }
      },
      orderBy: { createdAt: 'desc' } // Order by creation date to get the most recent price
    });

    if (relatedProducts.length === 0) {
      return res.status(404).json({ error: 'No products available with this product ID' });
    }

    // Get the most recent selling price (from the latest entry)
    const latestSellingPrice = relatedProducts[0].sellingPrice;

    // Calculate total available stock across all products with this productId
    const totalStock = relatedProducts.reduce((sum, product) => sum + product.stockQuantity, 0);

    // Get total quantity already sold from transactions
    const soldTransactions = await prisma.transaction.findMany({
      where: {
        product: {
          is: {
            productId: {
              equals: specificProduct.productId
            }
          }
        }
      },
      select: {
        quantity: true
      }
    });
    
    const totalSold = soldTransactions.reduce((sum, t) => sum + t.quantity, 0);
    
    // Calculate available stock
    const availableStock = totalStock - totalSold;

    console.log('Total Stock:', totalStock);
    console.log('Total Sold:', totalSold);
    console.log('Available Stock:', availableStock);

    // Check if enough stock is available
    if (availableStock < parsedQuantity) {
      return res.status(400).json({ 
        error: 'Not enough stock available',
        availableStock,
        requestedQuantity: parsedQuantity 
      });
    }

    // Create transaction using the latest selling price
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        productId: parsedProductId,
        quantity: parsedQuantity,
        sellingPrice: latestSellingPrice,
        discount: parsedDiscount
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            shopName: true
          }
        },
        product: true
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user transactions
export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get transaction summary
export const getTransactionSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // Get total sales
    const totalSales = await prisma.transaction.aggregate({
      where: { userId },
      _sum: {
        sellingPrice: true
      }
    });

    // Get total transactions
    const totalTransactions = await prisma.transaction.count({
      where: { userId }
    });

    // Get top selling products
    const topProducts = await prisma.transaction.groupBy({
      by: ['productId'],
      where: { userId },
      _sum: {
        quantity: true,
        sellingPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // Get product details for top products
    const productIds = topProducts.map((p: { productId: number }) => p.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      }
    });

    // Combine product details with sales data
    const topProductsWithDetails = topProducts.map((p: { productId: number; _sum: { quantity: number | null; sellingPrice: number | null } }) => {
      const product = products.find((prod: { id: number }) => prod.id === p.productId);
      return {
        productId: p.productId,
        productName: product?.name || 'Unknown',
        quantity: p._sum.quantity || 0,
        sellingPrice: p._sum.sellingPrice || 0
      };
    });

    res.json({
      totalSales: totalSales._sum.sellingPrice || 0,
      totalTransactions,
      topProducts: topProductsWithDetails
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}; 