
const express=require('express');
const protector = require('../middleware/authUser');
const { createReservation, getReservationByUser, getAllReservations, updateReservationStatus } = require('../controller/tableReservationController');

const router=express.Router();

router.post('/createReservation',protector,createReservation);
router.get('/getReservationByUser',protector,getReservationByUser);
router.get('/getAllreservations',getAllReservations);
router.patch('/updateReservationStatus',updateReservationStatus);


module.exports=router;