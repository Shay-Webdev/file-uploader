const { Router } = require('express');
const folderController = require('../controllers/folderController');

const folderRouter = Router();

folderRouter.get('/', folderController.getFolderPage);
folderRouter
  .route('/create')
  .get(folderController.getCreateFolderByUser)
  .post(folderController.createFolderByUser);
folderRouter
  .route('/delete/:id')
  .get(folderController.getDeleteFolderById)
  .post(folderController.deleteFolderById);
folderRouter
  .route('/rename/:id')
  .get(folderController.getRenameFolder)
  .post(folderController.renameFolder);
// Optional API routes
folderRouter.delete('/all', folderController.deleteAllFolders);
folderRouter.delete('/name/:name', folderController.deleteFolderByName);

module.exports = folderRouter;
