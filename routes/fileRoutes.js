const express = require('express');
const fileController = require('../controllers/fileController');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// File upload route - single file upload with field name 'file'
router.post('/', upload.single('file'), handleMulterError, fileController.uploadFile);

// Get all files
router.get('/', fileController.getAllFiles);

// Get file info
router.get('/:filename', fileController.getFileInfo);

// Download file
router.get('/:filename/download', fileController.downloadFile);

// Delete file - only managers can delete files
router.delete('/:filename', authorize('manager'), fileController.deleteFile);

module.exports = router;