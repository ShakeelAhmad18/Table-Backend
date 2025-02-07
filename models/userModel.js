const mongoose=require('mongoose')
const bycrypt=require('bcryptjs')

const userSchema=mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,'Please Add Name']
        },
        password:{
            type:String
        },
        phone:{
          type:String,
          required:true
        },
       role:{
        type:String,
        required:true,
        default:'user'
       },
       profilePic:{
        type:String,
        default:'https://avatar.iran.liara.run/public/boy'
       }
    },
    {
        timestamps:true
    }
)


userSchema.pre('save',async function(next){
     if(!this.isModified('password')){
         next()
     }

     const salt=await bycrypt.genSalt(10)
     const hashedPassword=await bycrypt.hash(this.password,salt)
     this.password=hashedPassword
     next();
})


const User=mongoose.model('User',userSchema);

module.exports=User;

