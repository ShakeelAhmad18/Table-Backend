const asyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')
const User=require('../models/userModel')
const account_Sid=process.env.ACC_SID
const Auth_secret=process.env.TWILIO_SECRET

const client=require('twilio')(account_Sid,Auth_secret);

//generate Token

const generateToken=(id)=>{
   return jwt.sign({ id },process.env.JWT_SECRET,{expiresIn:'1d'})
}


let OTP;
let user;

const registerUser=asyncHandler( async (req,res)=>{
    const {name,phone,password}=req.body;

    if(!name || !password || !phone){
        res.status(400) 
        throw new Error('fill all fields')
    }

   //check email is exist or not

   const PhoneExist=await User.findOne({phone})

   if(PhoneExist){

      return res.status(400).json({message:'User with this number Already Exist!Please Check'})

   }

   if(password.length < 8){
         return res.status(400).json({message:'Password must be 6 character'})
   }



   //cerate a user

   user=new User({
    name,
    phone,
    password
   })
    


   //send OTP

   let digit='0123456789'
   OTP="";

   for(let i=0;i<4;i++){
      OTP += digit[Math.floor(Math.random() * 10)]
   }


    await client.messages.create({
      body:`Your Verification OTP for user ${name} is ${OTP}`,
      from:'+14064767716',
      to:phone
    })
    .then(()=>res.status(200).json({message:'Message Sent'}))

  
    
   //generate Token
  // const token=generateToken(user._id)

   //send HTTP-only cookie

  /*res.cookie('token',token,{
    path:'/',
    httpOnly:true,
    expires:new Date(Date.now() + 1000 * 86400),
    sameSite:'none',
    secure:true
  })*/

  /*if(user){
      const {_id,name,email}=user;
      res.status(201).json({
        _id,
        name,
        email
      })
  }else{

     res.status(401).json({error:'Invalid user data'})

  }*/

})


const verifySignup=asyncHandler(async (req,res)=>{

const {otp}=req.body;

 if(otp != OTP){
  return res.status(400).json({message:'Incorrect OTP'})
 }


 user=await user.save();

 //generate Token
   const token=generateToken(user._id)

   //send HTTP-only cookie

  res.cookie('token',token,{
    path:'/',
    httpOnly:true,
    expires:new Date(Date.now() + 1000 * 86400),
    sameSite:'none',
    secure:true
  })

  const {_id,name,phone,profilePic,role}=user;

  res.status(201).json({
    _id,
    name,
    phone,
    profilePic,
    role,
    token
  })

  OTP="";

})


//login user

const loginUser=asyncHandler( async (req,res)=>{
    const {phone,password}=req.body;

  //validate request
  if(!phone || !password){
    return res.send(400).json({message:'Enter Phone and Password'})
  }

//find user exist
const user=await User.findOne({phone});


if(!user){
  return res.status(400).json({message:'User not found,Please SignUp'})
}

//token generate
const token=generateToken(user._id)

//check password
const passwordIsCorrect=await bcrypt.compare(password,user.password)

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


if(user && passwordIsCorrect){
  const {_id,name,phone,role,profilePic}=user;
  res.status(200).json(
    {
      _id,
      name,
      phone,
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
const logoutUser=asyncHandler(async (req,res)=>{
    res.cookie('token','',{
        path:'/',
        httpOnly:true,
        expires:new Date(0),
        sameSite:'none',
        secure:true
    })

    return res.status(200).json({message:'Logout Successfully'})
})

//get login status

const loginStatus = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(200).json(false); // Explicit response when no token is present
    }

    // Verify the token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    if (verified) {
      return res.status(200).json(true); // Token is valid
    }

    return res.status(200).json(false); // Token verification failed
  } catch (error) {
    // Handle token verification errors (e.g., expired or invalid token)
    return res.status(401).json(false);
  }
});

//get user
const getUser= asyncHandler(async (req,res)=>{

     const user=await User.findById(req.user._id);

     if(user){
        const {_id,name,email,profilePic}=user;
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
    registerUser,
    verifySignup,
    loginUser,
    logoutUser,
    loginStatus,
    getUser
}
