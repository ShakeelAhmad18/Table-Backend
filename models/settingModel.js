const mongoose=require('mongoose')

const settingsSchema = new mongoose.Schema({
    openingTime: { 
        type: String,
        required: true 
    }, // e.g., "09:00 AM"
    closingTime: { 
        type: String, 
        required: true
     }, // e.g., "09:00 PM"
    interval: {
         type: Number,
          required: true,
           default: 30 
        }, // Interval in minutes
  });
  
  
  const Settings = mongoose.model('Settings', settingsSchema);
  module.exports=Settings;
  