import express from 'express';
import { 
  getAllTransactions, 
  getTransaction, 
  createTransaction, 
  getUserTransactions,
  getTransactionSummary
} from '../controllers/transactionController';
import { auth } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(auth);

router.get('/', getAllTransactions);
router.get('/summary', getTransactionSummary);
router.get('/user', getUserTransactions);
router.get('/:id', getTransaction);
router.post('/', createTransaction);

export default router;

 