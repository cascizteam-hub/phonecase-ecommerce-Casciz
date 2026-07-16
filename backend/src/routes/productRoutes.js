import express from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
  getFilterMeta,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

const attachUploadedImages = (req, res, next) => {
  if (req.files?.length) {
    req.uploadedImages = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
  }
  next();
};

router.get('/', getProducts);
router.get('/filters/meta', getFilterMeta);
router.get('/:idOrSlug', getProductByIdOrSlug);

router.post('/', protect, authorize('admin'), upload.array('images', 6), attachUploadedImages, createProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 6), attachUploadedImages, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

router.post('/:id/reviews', protect, createReview);

export default router;
