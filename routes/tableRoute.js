const express = require('express');
const { upload } = require('../utils/fileUploads');
//const authAdmin = require('../middleware/authAdmin');
const { addTable, deleteTable, updateTable, getAvailTables, getTables, getTable, makeReservation} = require('../controller/tableController');

const router = express.Router();

router.post('/addTable',upload.single('image'),addTable);
router.delete('/deleteTable/:id',deleteTable);
router.patch('/updateTable/:tableId',upload.single('image'),updateTable);
router.get('/available-tables',getAvailTables);
router.get('/getTables',getTables);
router.get('/getTable',getTable);
router.post('/reserve',makeReservation)


module.exports = router;
