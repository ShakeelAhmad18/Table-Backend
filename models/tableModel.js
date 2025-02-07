const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({

  tableId: { 
    type: String,
    required: true,
    unique: true
  }, 
  name: { 
    type: String, 
    required: true 
  },   // Name or label (e.g., "Table 1")
  type: { 
    type: String, 
    required: true, 
    enum: ["Standard", "VIP"], // Possible table types
  },
  capacity: { 
    type: Number,
    required: true
  },
  area: {
    type: String,
    required: true,
    enum: ["DJ-Booth", "Bar-360", "Bar"]
  },
  image:{
    type:Object,
    default:{}
  },
  reservations: [{
    date: { 
      type: Date
    },
    time: { 
      type: String
    },
    capacity: { 
      type: Number, 
    }
  }]
}, 
{ 
  timestamps: true 
});


const Table = mongoose.model('Table', tableSchema);
module.exports = Table;
