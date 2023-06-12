const express = require('express')
const router = express.Router();
const userWebController = require('../controller/userWebController');
const webTokenValidator = require('../middleware/webTokenValidator');

router.post('/login', userWebController.userLogin);
router.post('/register', userWebController.userRegister);
router.post('/upload', userWebController.userUploadFile);
router.get('/getUserFiles', webTokenValidator, userWebController.getUserFiles);
router.get('/downloadUserFiles', webTokenValidator, userWebController.sendCompressedUserFiles);

module.exports = router;