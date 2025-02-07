const express=require('express');
const mongoose = require('mongoose');
const cookieParse=require('cookie-parser');
const bodyParser=require('body-parser');
const dotenv=require('dotenv').config();
const cors=require('cors');
const session=require('express-session');
const adminRoute=require('./routes/adminRoute');
const tableRoute=require('./routes/tableRoute');
const path=require('path');
const userRoute=require('./routes/userRoute')
const timeSlotRoute=require('./routes/timeSlotRoute');
const settingsRoute=require('./routes/settingsRoute')
const reservationRoute=require('./routes/ReservationRoute')


const app=express();

app.use(express.json())
app.use(cookieParse())
app.use(bodyParser.json())

app.use(express.urlencoded({extended:false}))
app.use(cors(
    {
        origin:['http://localhost:3000','http://localhost:5173'],
        credentials:true
    }
))


const PORT=8000;

mongoose.connect(process.env.MONGO_URI).then(()=>{
    app.get('/',(req,res)=>{
        res.send('Home Page Table booking')
    })
 })

 
 //middleware
 app.use('uploads',express.static(path.join(__dirname,'uploads')))
 app.use('/api/admin',adminRoute)
 app.use('/api/table',tableRoute)
 app.use('/api/user',userRoute)
 app.use('/api/restaurant',timeSlotRoute)
 app.use('/api/settings',settingsRoute)
 app.use('/api/reservation',reservationRoute)


 app.listen(PORT,(req,res)=>{
    console.log(`The server is running on port ${PORT}`)
 })
