const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// Base directory for uploads
const uploadDir = path.join(__dirname, '../uploads');

/**
 * Service for handling file operations
 */
class FileService {
  /**
   * Get file information
   * @param {string} filename - The name of the file
   * @returns {Object} File information
   */
  async getFileInfo(filename) {
    try {
      const filePath = path.join(uploadDir, filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      
      // Get file stats
      const stats = await fs.promises.stat(filePath);
      
      return {
        filename,
        path: filePath,
        size: stats.size,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get all files in the uploads directory
   * @param {Object} filters - Optional filters for files
   * @returns {Array} List of files
   */
  async getAllFiles(filters = {}) {
    try {
      // Read all files in the uploads directory
      const files = await fs.promises.readdir(uploadDir);
      
      // Get detailed information for each file
      const fileDetails = await Promise.all(
        files.map(async (filename) => {
          try {
            return await this.getFileInfo(filename);
          } catch (error) {
            console.error(`Error getting info for file ${filename}:`, error);
            return null;
          }
        })
      );
      
      // Filter out null values (files that couldn't be read)
      const validFiles = fileDetails.filter(file => file !== null);
      
      // Apply filters if provided
      if (filters.minSize) {
        return validFiles.filter(file => file.size >= filters.minSize);
      }
      
      if (filters.maxSize) {
        return validFiles.filter(file => file.size <= filters.maxSize);
      }
      
      if (filters.before) {
        const beforeDate = new Date(filters.before);
        return validFiles.filter(file => new Date(file.createdAt) <= beforeDate);
      }
      
      if (filters.after) {
        const afterDate = new Date(filters.after);
        return validFiles.filter(file => new Date(file.createdAt) >= afterDate);
      }
      
      return validFiles;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Delete a file
   * @param {string} filename - The name of the file to delete
   * @returns {boolean} True if deletion was successful
   */
  async deleteFile(filename) {
    try {
      const filePath = path.join(uploadDir, filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      
      // Delete the file
      await unlinkAsync(filePath);
      
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FileService();