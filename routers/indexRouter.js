const { Router } = require('express');
const indexRouter = Router();
const indexController = require('../controllers/indexController');
const uploadController = require('../controllers/uploadController');

indexRouter.get('/', indexController.getIndexpage);
indexRouter
  .route('/signup')
  .get(indexController.getSignup)
  .post(indexController.postSignUp);
indexRouter
  .route('/login')
  .get(indexController.getLogin)
  .post(indexController.postLogin);
indexRouter
  .route('/users')
  .get(indexController.getAllUsers)
  .post(indexController.getAllUsers);
indexRouter.get('/logout', indexController.getLogout);
indexRouter.get('/delete-users', indexController.deleteAllUsers);

indexRouter.route('/upload').get(uploadController.getUpload);

module.exports = { indexRouter };
