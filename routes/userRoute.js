const express=require('express');
const protector = require('../middleware/authUser');
const { registerUser, loginUser, logoutUser, getUser, verifySignup } = require('../controller/userController');
const { loginStatus } = require('../controller/adminController');

const router=express.Router();

router.post('/registerUser',registerUser);
router.post('/registerUser/verify',verifySignup);
router.post('/loginUser',loginUser)
router.get('/logout',logoutUser);
router.get('/loginStatus',loginStatus);
router.get('/getUser',protector,getUser);

module.exports=router;
