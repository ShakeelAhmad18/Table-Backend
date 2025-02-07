const express = require('express');
const moment = require('moment');
const Settings=require('../models/settingModel')
const TimeSlot=require('../models/TimeSlotModel')
const router = express.Router();

// Helper to generate time slots for a specific date
const generateTimeSlotsForDate = (date, openingTime, closingTime, interval) => {
    const slots = [];
    const startTime = moment(`${date}T${openingTime}`, 'YYYY-MM-DDTHH:mm A');
    const endTime = moment(`${date}T${closingTime}`, 'YYYY-MM-DDTHH:mm A');
  
    while (startTime.isBefore(endTime)) {
      slots.push({
        time: startTime.format('hh:mm A'), // Format time as "09:20 AM"
        date: date,                       // Use the given date
        available: true,                  // Default availability is true
      });
      startTime.add(interval, 'minutes'); // Increment by interval
    }
  
    return slots;
  };


// Endpoint for admin to add time slots
router.post('/add-time-slots', async (req, res) => {
    try {
      const { date } = req.body;
      console.log(date)
  
      if (!date) {
        return res.status(400).json({ message: 'Date is required.' });
      }
  
      // Validate the date format
      if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
      }
  
      // Fetch opening time, closing time, and interval from Settings table
      const settings = await Settings.findOne();
      if (!settings) {
        return res.status(404).json({ message: 'Settings not found. Please configure them first.' });
      }
  
      const { openingTime, closingTime, interval } = settings;
  
      // Generate time slots for one month
      const startDate = moment(date);
      const endDate = moment(date).add(1, 'month');
      const allTimeSlots = [];
  
      for (let current = startDate; current.isBefore(endDate); current.add(1, 'day')) {
        const slotsForDate = generateTimeSlotsForDate(
          current.format('YYYY-MM-DD'),
          openingTime,
          closingTime,
          interval
        );
        allTimeSlots.push(...slotsForDate);
      }
  
      // Insert all time slots into the database
      await TimeSlot.insertMany(allTimeSlots);
  
      res.status(201).json({
        message: `Time slots successfully created from ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}`,
      });
    } catch (error) {
      console.error('Error creating time slots:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });

  // Get available time slots for a specific date
  router.get('/available-time-slots', async (req, res) => {
    try {
      const { date } = req.query;
  
      // Validate the date parameter
      if (!date) {
        return res.status(400).json({ message: 'Date is required.' });
      }
  
      if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
      }
  
      // Query the database for available time slots on the given date
      const availableTimeSlots = await TimeSlot.find({ date, available: true });
  
      if (availableTimeSlots.length === 0) {
        return res.status(404).json({ message: 'No available time slots found for the specified date.' });
      }

      res.status(200).json({
        message: `Available time slots for ${date}.`,
        timeSlots: availableTimeSlots,
      });

    } catch (error) {
      console.error('Error retrieving available time slots:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });
  
  

 module.exports = router;
