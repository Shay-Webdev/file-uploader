const { Router } = require('express');
const indexRouter = Router();
const folderRouter = require('./folderRoute');
const indexController = require('../controllers/indexController');
const uploadController = require('../controllers/uploadController');
const multer = require('multer');

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

indexRouter
  .route('/upload')
  .get(uploadController.getUpload)
  .post(upload.single('file'), uploadController.postUpload);
indexRouter.get('/delete-user/:id', indexController.getDeleteUser);

indexRouter.use('/folders', folderRouter); // folder route is mounted
module.exports = { indexRouter };
