const db = require('../models/queries');

async function getUpload(req, res) {
  res.render('upload', {
    title: 'Upload',
    welcomeMessage: 'Upload',
    description: 'Upload your files and share them with the world',
  });
}

module.exports = { getUpload };
