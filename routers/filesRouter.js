const filesRouter = require('express').Router();
const filesController = require('../controllers/filesController');

filesRouter.get('/:id', filesController.getAllFiles);

module.exports = filesRouter;
