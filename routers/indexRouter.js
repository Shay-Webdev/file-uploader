const { Router } = require('express');
const indexRouter = Router();
const indexController = require('../controllers/indexController');

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

module.exports = { indexRouter };
