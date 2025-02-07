const asyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')
const Admin = require('../models/adminModel')

//generate Token

const generateToken=(id)=>{
   return jwt.sign({ id },process.env.JWT_SECRET)
}


const registerAdmin=asyncHandler( async (req,res)=>{
    const {name,email,password}=req.body;

    if(!name || !email || !password ){
        res.status(400) 
        throw new Error('fill all fields')
    }

   //check email is exist or not

   const EmailExist=await Admin.findOne({email})

   if(EmailExist){
    res.status(400)
    throw new Error('Email Already Exist!Please Login')
   }

   if(password.length < 8){
    res.status(400)
    throw new Error('Password must be 8 character')
   }

   //cerate a user

   const admin=await Admin.create({
      name,
      password,
      email
   })
    
   //generate Token
   const token=generateToken(admin._id)

   //send HTTP-only cookie

  res.cookie('token',token,{
    path:'/',
    httpOnly:true,
    expires:new Date('9999-12-31T23:59:59.999Z'),
    sameSite:'none',
    secure:true
  })

  if(admin){
      const {_id,name,email}=admin;
      res.status(201).json({
        _id,
        name,
        email
      })
  }else{

     res.status(401).json({error:'Invalid user data'})

  }

})


//login admin

const loginAdmin=asyncHandler( async (req,res)=>{
    const {email,password}=req.body;

  //validate request
  if(!email || !password){
    res.send(400)
    throw new Error('Enter Email and Password')
  }

//find user exist
const admin=await Admin.findOne({email});


if(!admin){
  res.status(400)
  throw new Error('User not found,Please SignUp')
}

//token generate
const token=generateToken(admin._id)

//check password
const passwordIsCorrect=await bcrypt.compare(password,admin.password)

if(passwordIsCorrect){

//send HTTP-only cookie
  res.cookie("token",token,{
    path:'/',
    httpOnly:true,
    expires:new Date(Date.now() + 1000 * 86400), //1 day
    sameSite:'none',
    secure:true
  })
}

if(admin && passwordIsCorrect){
  const {_id,name,email,role,profilePic}=admin;
  res.status(200).json(
    {
      _id,
      name,
      email,
      profilePic,
      role,
      token
    }
  )
}else{
  res.status(400).json({error:'InValid User Details'})
}
} )


//logout user
const logoutAdmin=asyncHandler(async (req,res)=>{
    res.cookie('token','',{
        path:'/',
        httpOnly:true,
        expires:new Date(0),
        sameSite:'none',
        secure:true
    })

    return res.status(200).json({message:'Logout Successfully'})
})

//get logout status

const loginStatus=asyncHandler( async (req,res)=>{
    const token= req.cookies.token;
    
    if(!token){
     return res.json(false)
    }
 
    //verified the token
    const verified=jwt.verify(token,process.env.JWT_SECRET);
    if(verified){
     return res.json(true)
    }
    return res.json(false)

} )

//get Admin
const getAdmin= asyncHandler(async (req,res)=>{

     const admin=await Admin.findById(req.admin._id);

     if(admin){
        const {_id,name,email,profilePic}=admin;
        res.status(200).json({
            _id,
            email,
            name,
            profilePic
        })
     }else{
        res.status(401)
        throw new Error('Unathorization User')
     }
})

module.exports={
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    loginStatus,
    getAdmin
}
