const asyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken');
const Admin = require('../models/adminModel');

const adminProtecter=asyncHandler( async (req,res,next)=>{

    try {

        const token=req.cookies.token;
        
        if(!token){
           res.status(401)
           throw new Error('Unauthorized user,please login')
        }
    
        const verified=jwt.verify(token,process.env.JWT_SECRET)
    
        //get user id from Token
    
        const admin=await Admin.findById(verified.id).select('-password')
        
        if(!admin){
            res.status(401)
            throw new Error('User not found')
        }
    
        req.admin=admin;
        next();
    
      } catch (error) {
    
        res.status(401)
        throw new Error('Not Authorized User')
      }
    
  } )
  
  module.exports=adminProtecter;