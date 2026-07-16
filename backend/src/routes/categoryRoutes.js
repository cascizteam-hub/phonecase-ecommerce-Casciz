import express from 'express';
import {
  getCategories,
  getCategoryByIdOrSlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

const attachUploadedImages = (req, res, next) => {
  if (req.file) {
    req.uploadedImages = [{ url: req.file.path, publicId: req.file.filename }];
  }
  next();
};

router.get('/', getCategories);
router.get('/:idOrSlug', getCategoryByIdOrSlug);

router.post('/', protect, authorize('admin'), upload.single('image'), attachUploadedImages, createCategory);
router.put('/:id', protect, authorize('admin'), upload.single('image'), attachUploadedImages, updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
