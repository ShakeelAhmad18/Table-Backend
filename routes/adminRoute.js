const express=require('express');
const adminProtecter = require('../middleware/authMiddleware');
const { registerAdmin, loginAdmin, logoutAdmin, getAdmin, loginStatus } = require('../controller/adminController');

const router=express.Router();

router.post('/registerAdmin',registerAdmin)
router.post('/loginAdmin',loginAdmin)
router.get('/logout',logoutAdmin)
router.get('/loginStatus',loginStatus)
router.get('/getAdmin',adminProtecter,getAdmin)

module.exports=router;
