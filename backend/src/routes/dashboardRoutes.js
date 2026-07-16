import express from 'express';
import { getDashboardSummary, getSalesAnalytics, getInventoryReport } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/summary', getDashboardSummary);
router.get('/sales', getSalesAnalytics);
router.get('/inventory', getInventoryReport);

export default router;
