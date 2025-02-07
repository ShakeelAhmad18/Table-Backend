const Table = require("../models/tableModel");
const Reservation = require("../models/tableReservationModel");

const formatDateToLocal = (date) => {
    // Get the UTC time and format it to a YYYY-MM-DD string
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return utcDate.toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
};

const createReservation = async (req, res) => {
    
    try {
        const { reservationDate, reservationTime, numberOfGuests, specialRequests, tableId } = req.body;

        if (!reservationDate || !reservationTime || !numberOfGuests || !tableId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const table=await Table.findById(tableId);
        if(!table){
            res.status(404).json({message:'Table not Found'})
        }

         
        // Convert reservationDate into a valid Date object
        const parsedDate = new Date(reservationDate);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: 'Invalid reservation date format' });
        }

        const formattedDate = formatDateToLocal(parsedDate);
        const normalizedTime = reservationTime.trim().toLowerCase(); // Normalize time

        // Check if the table is already booked for the specified date and time
        const existingReservation = await Reservation.findOne({
            tableId,
            reservationDate: {
              $eq: new Date(formattedDate).toISOString().split('T')[0], // Match only the date part
            },
            reservationTime: normalizedTime,
          });
          
        if (existingReservation) {
            return res.status(400).json({
                success: false,
                message: 'This table is already booked for the specified date and time.',
            });
        }
        const generateReservationId = () => `RES-${Math.floor(100000 + Math.random() * 900000)}`;

        const reservationId = generateReservationId();

        // Create a new reservation document
        const reservation = new Reservation({
            userId: req.user.id,
            reservationDate: formattedDate,
            reservationTime: normalizedTime,
            numberOfGuests,
            specialRequests,
            tableId:table._id,
            reservationId
        });

        await reservation.save();
        res.status(201).json({ success: true, data: reservation });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create reservation',
            error: error.message,
        });
    }
};


//get reservations by user

const getReservationByUser = async (req, res) => {
    try {
        // Fetch reservations for the logged-in user
        const reservations = await Reservation.find({ userId: req.user.id }).populate({
            path:'tableId',
            select:'name tableId area'
        }).sort('-createdAt');

        // Check if reservations exist
        if (reservations.length === 0) {
            return res.status(404).json({ message: 'No reservations found for this user' });
        }

        // Return the reservations
        res.status(200).json({ success: true, data: reservations });
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reservations',
            error: error.message,
        });
    }
};

//get All rservations for Admin

const getAllReservations=async (req,res)=>{
    
try {

    const resvations=await Reservation.find().populate({
        path:'userId',
        select:'name phone'
    }).populate({
        path:'tableId',
        select:'name tableId area'
    }).sort('-createdAt')

    if(resvations.length === 0){
        res.status(404).json({message:'Rservations Not Found'})
    }

    res.status(200).json(resvations);

    
} catch (error) {
    res.status(500).json({
        message:'Failed to fetch reservations',
        error:error.message
    })
}


}

//update the status
const updateReservationStatus=async (req,res)=>{

    const {reservationId,status}=req.body;
     
    if(!reservationId || !status){
        return res.status(400).json({message:'Reservation Id and Status are required'})
    }

    try {

        const reservation=await Reservation.findOne({reservationId});

        if(!reservation){
            res.status(404).json({message:'Reservation Not Found'})
        };

        const updateStatus=await Reservation.findOneAndUpdate(
            {reservationId:reservationId},
            {status},
            {
                new:true,
                runValidators:true
            }
        );

        res.status(200).json({success:true,data:updateStatus})
        
    } catch (error) {

        res.status(500).json({message:'Failed to update reservation status'});

    }
}




module.exports={
    createReservation,
    getReservationByUser,
    getAllReservations,
    updateReservationStatus
}

