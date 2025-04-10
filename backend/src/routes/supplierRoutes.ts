import express from 'express';
import { 
  getAllSuppliers, 
  getSupplier, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier 
} from '../controllers/supplierController';
import { auth } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(auth);

router.get('/', getAllSuppliers);
router.get('/:id', getSupplier);
router.post('/', createSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

export default router; 