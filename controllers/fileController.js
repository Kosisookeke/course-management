const fileService = require('../services/fileService');
const path = require('path');

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload and management
 */

/**
 * @swagger
 * /files:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: The file to upload
 *         required: true
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or upload error
 *       401:
 *         description: Unauthorized
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return file information
    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path.replace(/\\/g, '/') // Normalize path for cross-platform compatibility
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /files:
 *   get:
 *     summary: Get all files
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: minSize
 *         schema:
 *           type: integer
 *         description: Minimum file size in bytes
 *       - in: query
 *         name: maxSize
 *         schema:
 *           type: integer
 *         description: Maximum file size in bytes
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get files created before this date
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get files created after this date
 *     responses:
 *       200:
 *         description: List of files
 *       401:
 *         description: Unauthorized
 */
const getAllFiles = async (req, res) => {
  try {
    const filters = {
      minSize: req.query.minSize ? parseInt(req.query.minSize) : undefined,
      maxSize: req.query.maxSize ? parseInt(req.query.maxSize) : undefined,
      before: req.query.before,
      after: req.query.after
    };

    const files = await fileService.getAllFiles(filters);
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /files/{filename}:
 *   get:
 *     summary: Get a file by filename
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename
 *     responses:
 *       200:
 *         description: File details
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 */
const getFileInfo = async (req, res) => {
  try {
    const fileInfo = await fileService.getFileInfo(req.params.filename);
    res.json(fileInfo);
  } catch (error) {
    if (error.message === 'File not found') {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /files/{filename}/download:
 *   get:
 *     summary: Download a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename
 *     responses:
 *       200:
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 */
const downloadFile = async (req, res) => {
  try {
    const fileInfo = await fileService.getFileInfo(req.params.filename);
    res.download(fileInfo.path, path.basename(fileInfo.path));
  } catch (error) {
    if (error.message === 'File not found') {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /files/{filename}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Filename
 *     responses:
 *       204:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 */
const deleteFile = async (req, res) => {
  try {
    await fileService.deleteFile(req.params.filename);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'File not found') {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadFile,
  getAllFiles,
  getFileInfo,
  downloadFile,
  deleteFile
};