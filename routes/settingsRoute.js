const express=require('express');
const { addSettings } = require('../controller/settingsControllers');
const router=express.Router();


router.post('/Add-Settings',addSettings);


module.exports=router;