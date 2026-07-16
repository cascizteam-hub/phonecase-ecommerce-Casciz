import asyncHandler from 'express-async-handler';
import cloudinary from '../config/cloudinary.js';

// POST /api/upload  (multipart, field "images", multiple allowed)
export const uploadImages = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);
  if (files.length === 0) {
    res.status(400);
    throw new Error('No files uploaded');
  }

  const images = files.map((f) => ({ url: f.path, publicId: f.filename }));
  res.status(201).json({ images });
});

// POST /api/upload/delete  { publicId }
// (publicId contains slashes from the Cloudinary folder path, so it's passed
// in the body rather than as a URL param.)
export const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) {
    res.status(400);
    throw new Error('publicId is required');
  }
  await cloudinary.uploader.destroy(publicId);
  res.status(200).json({ message: 'Image deleted' });
});
