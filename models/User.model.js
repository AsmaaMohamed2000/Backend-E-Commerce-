const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken')

const { BsNutFill } = require('react-icons/bs');

const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    postalCode: {
      type: String,
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

  avatar: {
    url: {
        type: String,
        default: ""
    },
    publicId: {
        type: String,
        default: ""
    }
},

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    addresses: [addressSchema],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
tokens:[
    {
        token:{
            type:String
        }
    }
    
],
    isVerified: {
      type: Boolean,
      default: false,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpire: {
      type: Date,
      default: null,
    },
    passwordChangedAt:{
type:Date
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function () {

  if (!this.isModified("password")) {
    return ;
  }

  this.password = await bcrypt.hash(this.password, 10);

 

});
userSchema.methods.comparePassword = async function (enteredPassword) {

  return await bcrypt.compare(
    enteredPassword,
    this.password
  );

};


userSchema.methods.generateAccessToken= function(){
       const token = jwt.sign(
          { id: this._id, role:this.role,type:'access_token' },
          process.env.ACCESS_TOKEN,
          { expiresIn: '30d' }
        )
        return token
}
userSchema.methods.generateRefreshToken=async function(){
    // const {ip,device}=data
       const token = jwt.sign(
          { id: this._id ,type:'refresh_token'},
          process.env.REFRESH_TOKEN,
          { expiresIn: '30d' }
        )
        
        const hashedToken=await bcrypt.hash(token,10)
        this.tokens.push({token:hashedToken})
        await this.save()
     
        return token
}
userSchema.methods.toJSON=function(){
     const user=this.toObject()
     delete user.password 
       delete user.resetPasswordExpire
         delete user.resetPasswordToken
       delete user.tokens
         delete user.__v
       

     return user
}
module.exports =
  mongoose.models.User || mongoose.model('User', userSchema)