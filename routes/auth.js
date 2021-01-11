const express = require('express');
const router = express.Router();

//import controller
const {
    signup,
    accountActivation,
    signin
} = require('../controllers/auth');

// import validators
const { userSignupValidator, userSigninValidator } = require('../validators/auth');
const { runValidation } = require('../validators');

//localhost:8000/api/signup
router.post("/signup", userSignupValidator, runValidation, signup);
router.post('/account-activation', accountActivation);
router.post("/signin", userSigninValidator, runValidation, signin);

//routerをmodule.exportsを使って他のファイルからインポートできるようにする
module.exports = router