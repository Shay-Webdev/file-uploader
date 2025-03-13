const db = require('../models/queries');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

async function getUpload(req, res) {
  res.render('upload', {
    title: 'Upload',
    welcomeMessage: 'Upload',
    description: 'Upload your files and share them with the world',
  });
}

async function postUpload(req, res) {
  console.log('uploaded file: ', req.file);
  res.redirect('/');
}

module.exports = { getUpload, postUpload };
