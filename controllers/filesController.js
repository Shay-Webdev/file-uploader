const db = require('../models/queries');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', 'folders');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const id = Number(req.params.id);

    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

async function getAllFiles(req, res) {
  try {
    const id = Number(req.params.id);
    console.log(
      'params id in get all files: ',
      req.params,
      'original url: ',
      req.originalUrl
    );
    const folder = await db.getFolderByIdInDb(id);
    console.log('folder in get all files: ', folder);

    const allFiles = await db.getAllFilesByFolderId(folder.id);
    res.render('files', {
      title: 'Files',
      files: allFiles,
    });
  } catch (err) {
    res.status(500).send('Server error: ' + err);
  }
}

module.exports = {
  getAllFiles,
};
