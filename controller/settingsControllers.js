const Settings = require("../models/settingModel");

const addSettings=async (req, res) => {
    const { openingTime, closingTime, interval } = req.body;
  
    if (!openingTime || !closingTime || !interval) {
      return res
        .status(400)
        .json({ error: 'Opening time, closing time, and interval are required.' });
    }
  
    try {
      const settings = await Settings.findOneAndUpdate(
        {},
        { openingTime, closingTime, interval },
        { upsert: true, new: true }
      );
  
      res.status(200).json({ message: 'Settings updated successfully.', settings });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings.' });
    }
  };
   
   


  module.exports={
    addSettings
  }