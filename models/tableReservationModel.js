
const mongoose = require('mongoose');
const { Schema } = mongoose;

const reservationSchema = new mongoose.Schema({
   userId:{
    type:Schema.Types.ObjectId,
    ref:'User',
    required:true
   },
  reservationDate: {
    type: Date,
    required: true,
  },
  reservationTime: {
    type: String,
    required: true, // e.g., '18:00'
  },
  numberOfGuests: {
    type: Number,
    required: true,
  },
  specialRequests: {
    type: String,
    required: false, // Optional field for special requests
  },
  tableId: {
    type: Schema.Types.ObjectId,
    ref: 'Table', 
    required: true
  },
  reservationId:{
        type:String,
        required:true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending',
  }
},
{
    timestamps:true
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
