const Table = require("../models/tableModel"); // Assuming Table model is in the 'models' folder
const Reservation = require("../models/tableReservationModel");
const { fileSizeFormatter } = require('../utils/fileUploads');
const couldinary=require('cloudinary').v2
//const {io} = require('../socket/socket')


const formatDateToLocal = (date) => {
  // Get the UTC time and format it to a YYYY-MM-DD string
  const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return utcDate.toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
};

const normalizeTime = (time) => {
  const [timePart, modifier] = time.trim().toLowerCase().split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'pm' && hours !== 12) hours += 12;
  if (modifier === 'am' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Create a new table
const addTable = async (req, res) => {

  const { tableId, name, type, capacity, area } = req.body;
  try {
      
       let fileData={};
       if(req.file){
        //save image to cloudinary
        let uploadFile;
        try {
          uploadFile=await couldinary.uploader.upload(req.file.path,{
              folder:"Menu Pizza",resource_type:'image'
          })
          
        } catch (error) {
          res.status(500)
          throw new Error('Images could not be uploaded')
        }
          fileData = {
              fileName:req.file.originalname,
              filePath:uploadFile.secure_url,
              fileType:req.file.type,
              fileSize: fileSizeFormatter(req.file.size,2)
          }
      }
      
    const newTable = new Table({
      tableId,
      name,
      type,
      capacity,
      area,
      image:Object.keys(fileData).length === 0 ? 'there is error' : fileData,
      reservations: []
    });


    await newTable.save();
    //io.emit('tableAdded', newTable);

    res.status(201).json({ message: 'Table added successfully', table: newTable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing table by tableId
const updateTable = async (req, res) => {

  try {
    const { tableId } = req.params;
    const { name, type, capacity, area } = req.body;

    // Find the table by tableId
    const table = await Table.findOne({tableId});
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    let fileData={};
    
       if(req.file)
      {
       //save image to cloudinary
       let uploadFile;
       try {
         uploadFile=await couldinary.uploader.upload(req.file.path,{
             folder:"Menu Pizza",resource_type:'image'
         })
       } catch (error) {
         res.status(500)
         throw new Error('Images could not be uploaded')
       }
    
       fileData = {
        fileName:req.file.originalname,
        filePath:uploadFile.secure_url,
        fileType:req.file.type,
        fileSize: fileSizeFormatter(req.file.size,2)
    }
    
      }

      const updateData={
        name,
        type,
        capacity,
        area
      }

      if (Object.keys(fileData).length !== 0) {
        updateData.image = fileData; // Add the image only when `fileData` is valid
    }

     
  
    const updateTable=await Table.findOneAndUpdate({tableId:tableId},
      updateData,
    {
      new:true,
      runValidators:true
    })

    //io.emit('tableUpdated',updateTable);

    res.status(200).json({ message: 'Table updated successfully', updateTable });
  } catch (error) {
    res.status(500).json({ message: 'Error updating table', error });
  }
};

// Delete a table by tableId
const deleteTable = async (req, res) => {
  try {
    const { tableId } = req.params;

    // Find the table by tableId and delete it
    const table = await Table.findOneAndDelete({ tableId });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    

    //io.emit('tableDeleted',tableId);
    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting table', error });
  }
};



const getAvailTables = async (req, res) => {
  const { date, time, capacity } = req.query;
   
   
  
  try {
    // Validate inputs
    if (!date || !time || !capacity) {
      return res.status(400).json({ message: 'Please provide date, time, and capacity.' });
    }

    // Convert inputs for proper comparison
    const requiredCapacity = parseInt(capacity, 10);
    if (isNaN(requiredCapacity)) {
      return res.status(400).json({ message: 'Capacity must be a valid number.' });
    }

    // Normalize date and time
    const normalizedDate = new Date(date).toISOString().split('T')[0]; // Keep only the date part
    const normalizedTime = time.trim().toLowerCase();

    // Find tables with conflicting reservations
    const reservedTableIds = await Reservation.find({
      reservationDate: new Date(normalizedDate),
      reservationTime: normalizedTime,
    }).distinct('tableId'); // Get only the table IDs of reserved tables


    // Find available tables
    const availableTables = await Table.find({
      capacity: { $gte: requiredCapacity },
      _id: { $nin: reservedTableIds }, // Exclude reserved tables
    });

    if (availableTables.length === 0) {
      return res.status(200).json({
        message: 'No available tables found for the selected date, time, and capacity.',
      });
    }

    res.status(200).json({ availableTables });
  } catch (error) {
    console.error('Error finding available tables:', error);
    res.status(500).json({
      message: 'An error occurred while finding available tables.',
      error: error.message,
    });
  }
};



const getTables= async (req,res)=>{

  const table=await Table.find();

  if(!table){
    res.status(400).json('Tables Not Found');
 }

 res.status(200).json({table})

 }


 const getTable=async (req,res)=>{
    const {tableId}=req.query;

    const table=await Table.findOne({tableId});

    if(!table){
      return res.status(404).json({msg:'Table Not Found'})
    }
    
    
    
    res.status(200).json({table})

 }



 //make reservation
 const makeReservation = async (req, res) => {
  try {
    const { tableId, date, time, capacity } = req.body;

    // Validate input
    if (!tableId || !date || !time || !capacity) {
      return res.status(400).json({ message: 'All fields are required: tableId, date, time, capacity' });
    }

    // Convert and normalize date and time
    const formattedDate = formatDateToLocal(new Date(date));
    const normalizedTime = time.trim().toLowerCase(); // Normalize time

    // Find the table by ID
    const table = await Table.findOne({ tableId });
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Check for conflicting reservations by comparing the date without time
    const isConflict = table.reservations.some(
      (reservation) =>
        formatDateToLocal(new Date(reservation.date)) === formattedDate && // Stripping time from stored date
        reservation.time.trim().toLowerCase() === normalizedTime // Normalize time in reservation for comparison
    );

    if (isConflict) {
      return res.status(400).json({ message: 'The table is already reserved for the selected date and time' });
    }

    // Add the reservation to the table's reservations
    table.reservations.push({ date: formattedDate, time: normalizedTime, capacity });

    // Save the updated table
    await table.save();

    res.status(201).json({
      message: 'Reservation successfully added to the table',
      reservation: { tableId, date: formattedDate, time: normalizedTime, capacity },
    });
  } catch (error) {
    console.error('Error making reservation:', error);
    res.status(500).json({ message: 'An error occurred while making the reservation', error: error.message });
  }
};



module.exports = { 
     addTable, 
     deleteTable, 
     updateTable,
     getAvailTables,
     getTables,
     getTable,
     makeReservation
    };

