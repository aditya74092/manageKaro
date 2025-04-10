import express from 'express';
import { 
  getAllProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  updateStock,
  getProductsByProductId
} from '../controllers/productController';
import { auth } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(auth);

router.get('/', getAllProducts);
router.get('/byProductId/:productId', getProductsByProductId);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/:id/stock', updateStock);

export default router; 