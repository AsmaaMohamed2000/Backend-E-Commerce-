
const User = require('../models/user.model')
const Otp = require('../models/Otp.model')
const mongoose=require('mongoose')
const {sendOtp,sendURL} = require('../utilities/sendEmail')
const uploadToCloudinary=require('../utilities/cloudinary')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
// const console = require('console')
// const { date } = require('joi')


const authService = {

  register: async (data,avatarFile) => {

  const { username, email, password, phone } = data;

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new Error("User already exists");
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new Error("Username already exists");
  }
     const otp = await Otp.findOne({
      email,
      type: 'verify-email'
    }).sort({ createdAt: -1 })
    if(otp&&otp.expiresAt>new Date()){
  throw new Error("otp already sent check your email");
    }

  await Otp.deleteMany({
    email,
    type: "verify-email",
  });

  const plainOtp = crypto.randomInt(100000, 1000000).toString();
  const hashedOtp = await bcrypt.hash(plainOtp, 10);
let avatar={
  url:'',
  publicId:''
}
 
if(avatarFile){
  let uploaded


   try{
    uploaded = await uploadToCloudinary(
        avatarFile.buffer,
        "users"
    );
   
   }catch(err){
    console.log(err)
   }
    avatar = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id
    };
   
}

  await Otp.create({
    email,
    code: hashedOtp,
    type: "verify-email",
    expiresAt:  Date.now() + 5 * 60 * 1000,
    userData: {
      username,
      email,
      password,
      phone,
      avatar
    },
  });

  await sendOtp(email, username, plainOtp);

  return {
    success: true,
    message: "Verification code sent to your email",
  };
},


verifyOtp: async (data) => {

    const { email, code } = data;

        const otp = await Otp.findOne({
            email,
            type: "verify-email",
            expiresAt: { $gt: Date.now() }
        }).sort({ createdAt: -1 });

        if (!otp) {
            throw new Error("Invalid or expired OTP.");
        }

        
        // if (otp.expiresAt < new Date()) {
        //     await Otp.deleteMany(
        //         {
        //             email,
        //             type: "verify-email"
        //         }
               
        //     );

        //     throw new Error("OTP expired.");
        // }

     
        if (otp.attempts >= 5) {
            throw new Error(
                "Too many attempts. Please request a new OTP."
            );
        }

       
        const validOtp = await bcrypt.compare(
            code,
            otp.code
        );

        if (!validOtp) {

            otp.attempts += 1;

            await otp.save();

            throw new Error("Invalid OTP.");
        }

     
       
      
        const user = await User.create(
            {
                username: otp.userData.username,
                email: otp.userData.email,
                password: otp.userData.password,
                phone: otp.userData.phone,
                isVerified: true
            },
           
        );

       
        await Otp.deleteMany(
            {
                email,
                type: "verify-email"
            }
        );

      

        return {
            success: true,
            message: "Email verified successfully.",
            user: user
        };

    

},


  login: async (data) => {
    const { email, password} = data
 if (!email || !password) {
  throw new Error('email and password require')
 }
 
 const user = await User.findOne({ email }).select('+password')

    if (!user) {
      throw new Error('Invalid email or password')
    }
 if (!user.isVerified) {
      throw new Error('Please verify your email first')
    }

    const validPassword =await user.comparePassword(password)

    if (!validPassword) {
      throw new Error('Invalid email or password')
    }

    

   
    const access_token = await user.generateAccessToken()
    const refresh_token=await user.generateRefreshToken()

    return {
      success: true,
      message: 'Login successful',
      access_token,
      user,
      refresh_token
    }
  },


  forgotPassword: async (data) => {
    const { email } = data

    const user = await User.findOne({ email })

    if (!user) {
      throw new Error('User not found')
    }

    const token = crypto.randomBytes(32).toString('hex')

    const hashToken = crypto.createHash('sha256').update(token).digest('hex')

   user.resetPasswordToken=hashToken
   user.resetPasswordExpire=Date.now()+5*60*1000
await user.save({ validateBeforeSave: false })
   const resetUrl=`${process.env.CLIENT_URL}/reset-password?token=${token}`
try{
   await sendOtp(email,resetUrl);
}catch(err){
    user.resetPasswordToken=null
   user.resetPasswordExpire=null
   await user.save()
}
    return {
      success: true,
      message: 'reset link sent to email',token
    }
  },


 resetPassword: async (data) => {

    const { token, newPassword } = data;

   
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

   
    const user = await User.findOne({

        resetPasswordToken: hashedToken,

        resetPasswordExpire: {
            $gt: Date.now()
        }

    }).select("+password");

    if (!user) {

        throw new Error(
            "Invalid or expired reset link."
        );

    }

  
    const samePassword =
        await user.comparePassword(newPassword);

    if (samePassword) {

        throw new Error(
            "New password must be different from the current password."
        );

    }

  
    user.password = newPassword;

   
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

   
    user.passwordChangedAt = new Date();

    await user.save();
     const access_token = await user.generateAccessToken()
    const refresh_token=await user.generateRefreshToken()

    return {

        success: true,
access_token,
refresh_token,
        message:
            "Password reset successfully."

    };

},
regenerateAccessToken: async (token) => {
  if (!token) {
    throw new Error("No refresh token");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN);
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.id).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  let matchedToken = null;

  for (const item of user.tokens) {
    const isMatch = await bcrypt.compare(token, item.token);

    if (isMatch) {
      matchedToken = item;
      break;
    }
  }

  if (!matchedToken) {
    throw new Error("Invalid refresh token");
  }

  user.tokens = user.tokens.filter(
    (item) => item._id.toString() !== matchedToken._id.toString()
  );

  await user.save();

  const newAccessToken = user.generateAccessToken();

  // هذه الدالة تضيف hash إلى user.tokens وتحفظ المستخدم تلقائيًا
  const newRefreshToken = await user.generateRefreshToken();

  return {
    newAccessToken,
    newRefreshToken,
    user,
  };
},
logout:async(token)=>{

   if(!token){

      throw new Error('No refresh token')
   }
let decoded
 try{
    decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN
   )
 }catch(err){
  throw new Error('refresh token expired')
 }

   const user = await User.findById(decoded.id)

   if(!user){

      throw new Error('User not found')
   }

   let matchedToken = null


   for(const item of user.tokens){

      const isMatch = await bcrypt.compare(
         token,
         item.token
      )

      if(isMatch){
        matchedToken=item

       
         break
      }
   }

   if(!matchedToken){

      throw new Error('Invalid refresh token')
   }
   user.tokens=user.tokens.filter((item)=>(
      item._id.toString()!==matchedToken._id.toString()
    ))
  
    await user.save()


   return {success:true}

},


}

module.exports = authService