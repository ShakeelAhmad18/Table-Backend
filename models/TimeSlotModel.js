const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  time: { 
    type: String,  // Time of the slot (e.g., 1:00 PM, 1:30 PM, etc.)
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  available: { 
    type: Boolean, 
    default: true  // Slots are available by default
  }
});





const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
module.exports = TimeSlot;
