const {Server} = require('socket.io')
const http = require('http')
const express=require('express')



const app=express();


const server=http.createServer(app)

const io=new Server(server,{
    cors:{
        origin:['http://localhost:3000','http://localhost:5173'],
        methods:'GET,POST,DELETE,PUT',
        credentials:true
    }
})

  // get reciever socketID
 const getRecieverSocketId=(recieverId)=>{
      return userSocketMap[recieverId]
}


const userSocketMap={}  //{userId: socketId}





io.on('connection',(socket)=>{
    console.log('User Connected',socket.id)

    const userId=socket.handshake.query.userId
    if(userId !== 'undefined'){
      userSocketMap[userId] = socket.id
    }

    //io.emit is used to send events to all the clients
    io.emit('getOnlineUsers',Object.keys(userSocketMap))

    //socket.on is used to listen to the event it is used on both ends clent and server
    io.on('disconnect',()=>{
        console.log('User disconnected',socket.id)
        //when user are not online
        delete userSocketMap[userId]
        io.emit('getOnlineUsers',Object.keys(userSocketMap))
    })
})





module.exports= {app,io,server,getRecieverSocketId}



