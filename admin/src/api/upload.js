import api from './axios';

export const uploadImagesApi = (files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('images', file));
  return api
    .post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);
};

export const deleteImageApi = (publicId) => api.post('/upload/delete', { publicId }).then((r) => r.data);
