const fs = require('fs').promises;
const path = require('path');
const db = require('../models/queries');
const multer = require('multer');
const { validationResult } = require('express-validator');
const validation = require('../validation&Authentication/validation');
const cloudinary = require('cloudinary').v2;

const BASE_DIR = path.join(__dirname, '..', 'folders');

// Configure multer storage (no file type restriction)
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      const folderId = req.params.folderId;
      if (!folderId) {
        return cb(new Error('Folder ID is required'));
      }

      const folder = await db.getFolderByIdInDb(Number(folderId));
      if (!folder || folder.userId !== req.user.id) {
        return cb(new Error('Folder not found or not authorized'));
      }

      const folderPath = folder.path;
      await fs.mkdir(folderPath, { recursive: true });
      cb(null, folderPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit (adjust as needed)
});

async function getUpload(req, res) {
  try {
    if (!req.user) {
      return res.status(401).render('error', { message: 'Unauthorized' });
    }
    const folders = await db.getFoldersByUserId(req.user.id);
    res.render('upload', {
      title: 'Upload',
      welcomeMessage: 'Upload',
      description: 'Upload any file to share with the world (up to 50MB)',
      folders,
    });
  } catch (err) {
    res
      .status(500)
      .render('error', { message: `Server error: ${err.message}` });
  }
}

const postUpload = [
  validation.uploadValidation,
  upload.single('file'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const folders = await db.getFoldersByUserId(req.user.id);
        return res.status(400).render('upload', {
          title: 'Upload',
          welcomeMessage: 'Upload',
          description: 'Upload any file to share with the world (up to 50MB)',
          folders,
          error: errors.array(),
        });
      }

      if (!req.file) {
        throw new Error('No file uploaded');
      }

      const folderId = req.params.folderId;
      const folder = await db.getFolderByIdInDb(Number(folderId));
      if (!folder || folder.userId !== req.user.id) {
        throw new Error('Invalid folder');
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          req.file.path,
          { resource_type: 'auto' }, // Auto-detect file type
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });

      // Save to database
      await db.createFileInDb({
        name: req.file.originalname,
        path: result.secure_url,
        folderId: Number(folderId),
        size: req.file.size,
        mimeType: req.file.mimetype, // Store file type for later use
      });

      // Clean up local file
      await fs.unlink(req.file.path);

      console.log('Uploaded file:', req.file);
      console.log('Cloudinary result:', result);
      res.redirect('/folders');
    } catch (err) {
      const folders = await db.getFoldersByUserId(req.user.id);
      res.status(400).render('upload', {
        title: 'Upload',
        welcomeMessage: 'Upload',
        description: 'Upload any file to share with the world (up to 50MB)',
        folders,
        error: [{ msg: `Upload failed: ${err.message}` }],
      });
    }
  },
];

module.exports = { getUpload, postUpload };
