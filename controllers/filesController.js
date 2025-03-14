const db = require('../models/queries');
const { check, validationResult } = require('express-validator');

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
