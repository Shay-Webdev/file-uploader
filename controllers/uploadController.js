const db = require('../models/queries');
const multer = require('multer');
const { check, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

const BASE_DIR = path.join(__dirname, '..', 'folders');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

async function getUpload(req, res) {
  const folders = await db.getFoldersByUserId(req.user.id);
  res.render('upload', {
    title: 'Upload',
    welcomeMessage: 'Upload',
    description: 'Upload your files and share them with the world',
    folders: folders,
  });
}

async function postUpload(req, res) {
  console.log('uploaded file: ', req.file);

  res.redirect('/');
}

module.exports = { getUpload, postUpload };
