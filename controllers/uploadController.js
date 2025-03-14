const fs = require('fs').promises;
const path = require('path');
const db = require('../models/queries');
const multer = require('multer');
const { validationResult } = require('express-validator');
const validation = require('../validation&Authentication/validation');

const BASE_DIR = path.join(__dirname, '..', 'folders');

// Configure multer storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      const folderId = req.params.folderId; // Get folder ID from URL
      if (!folderId) {
        return cb(new Error('Folder ID is required'));
      }

      const folder = await db.getFolderByIdInDb(Number(folderId));
      if (!folder || folder.userId !== req.user.id) {
        return cb(new Error('Folder not found or not authorized'));
      }

      const folderPath = folder.path; // Use the folder's stored path
      await fs.mkdir(folderPath, { recursive: true }); // Ensure folder exists
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

const upload = multer({ storage: storage });

async function getUpload(req, res) {
  try {
    if (!req.user) {
      return res.status(401).render('error', { message: 'Unauthorized' });
    }
    const folders = await db.getFoldersByUserId(req.user.id);
    res.render('upload', {
      title: 'Upload',
      welcomeMessage: 'Upload',
      description: 'Upload your files and share them with the world',
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
          description: 'Upload your files and share them with the world',
          folders,
          error: errors.array(),
        });
      }

      console.log('Uploaded file:', req.file);
      res.redirect('/folders'); // Redirect to folder list after upload
    } catch (err) {
      res.status(500).render('upload', {
        title: 'Upload',
        welcomeMessage: 'Upload',
        description: 'Upload your files and share them with the world',
        folders: await db.getFoldersByUserId(req.user.id),
        error: [{ msg: `Upload failed: ${err.message}` }],
      });
    }
  },
];

module.exports = { getUpload, postUpload };
