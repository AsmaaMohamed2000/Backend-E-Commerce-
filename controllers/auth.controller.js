// const authService = require('../services/auth.service')

// const authController = {

//     register: async (req, res) => {
       
//         try {

//             const result = await authService.register(req.body,req.file)

//             res.status(201).json(result)

//         } catch (error) {

//             res.status(400).json({
//                 success: false,
//                 type:'bussiness',
//                 message: error.message,
//                 errors:[]
//             })
//         }
//     },
// editUser:async(req,res)=>{
//     try{
//         const result=await authService.editUserInfo(req.body)
//              res.status(201).json(result)

//         } catch (error) {

//             res.status(400).json({
//                 success: false,
//                 type:'bussiness',
//                 message: error.message,
//                 errors:[]
//             })
        
//     }
// },
//     verifyOtp: async (req, res) => {
//         try {

//             const result = await authService.verifyOtp(req.body)

//             res.status(200).json(result)

//         } catch (error) {

//             res.status(400).json({
//                success: false,
//                 type:'bussiness',
//                 message: error.message,
//                 errors:[]
//             })
//         }
//     },

   
//     login: async (req, res) => {
//         try {

//             const {
//       success,
//       message,
//       access_token,
//       user,
//       refresh_token
//     } = await authService.login({...req.body,ip:req.ip,device:req.headers['sec-ch-ua-platform']||'unknown device'})

//             res.cookie('refresh_token', refresh_token, {
//                 httpOnly: true,
//                 secure:process.env.NODE_ENV==='Production',
//                 sameSite: 'strict',
//                 maxAge: 1000 * 60 * 60 * 24 * 7
//             })

//             res.status(200).json({
//       success,
//       message,
//       access_token,
//       user,
      
//     })

//         } catch (error) {

//             res.status(400).json({
//                success: false,
//                 type:'bussiness',
//                 message: error.message,
//                 errors:[]
//             })
//         }
//     },

    
//     forgotPassword: async (req, res) => {
//         try {

//             const result = await authService.forgotPassword(req.body)

//             res.status(200).json(result)

//         } catch (error) {

//             res.status(400).json({
//                  success: false,
//                 type:'bussiness',
//                 message: error.stack,
//                 errors:[]
//             })
//         }
//     },

//     resetPassword: async (req, res) => {
//         try {

//             const result = await authService.resetPassword(req.body)

//             res.status(200).json(result)

//         } catch (error) {

//             res.status(400).json({
//                   success: false,
//                 type:'bussiness',
//                 message: error.message,
//                 errors:[]
//             })
//         }
//     },
//     refreshToken:async (req,res)=>{
//         try{
// const tokens=await authService.regenerateAccessToken(req.cookies.refresh_token)
// res.cookie('refresh_token',tokens.newRefreshToken,{
//     httpOnly:true,sameSite:'strict',secure:false,maxAge:1000*7*24*60*60
// })
// res.status(200).json({
//     success:true,accessToken:tokens.newAccessToken ,user:tokens.user
// })
//         }catch(err){
//               res.status(400).json({
//                 success: false,
//                 message: err.stack
//             })
//         }
//     },
//     logout:async(req,res)=>{
       
//           try{
//             const refreshToken=req.cookies.refresh_token
// const result=await authService.logout(refreshToken)

//  res.clearCookie('refresh_token',refreshToken, {
//                 httpOnly: true,
//                 secure:process.env.NODE_ENV==='Production', 
//                 sameSite: 'strict',
              
//             })
// res.status(200).json(result)
//         }catch(err){
//               res.status(401).json({
//                 success: false,
//                 message: err.stack
//             })
//         }
//     },
//      getMe:async(req,res)=>{
       
//           try{
          
// res.status(200).json({
//     success:true,
//     user:req.user
// })
//         }catch(err){
//               res.status(401).json({
//                 success: false,
//                 message: err.message
//             })
//         }
//     }

// }

// module.exports=authController


const authService = require("../services/auth.service");

const authController = {
  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body, req.file);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      const result = await authService.verifyOtp(req.body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = await authService.login(
        req.body
      );

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: result.success,
        message: result.message,
        accessToken: result.accessToken,
        user: result.data,
      });
    } catch (error) {
      next(error);
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const result = await authService.refreshToken(
        req.cookies.refreshToken
      );

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      const result = await authService.logout(
        req.cookies.refreshToken
      );

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const result = await authService.forgotPassword(req.body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const result = await authService.resetPassword(req.body);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req, res, next) => {
    try {
      const result = await authService.getMe(req.user._id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  changeRole: async (req, res, next) => {
    try {
      const result = await authService.changeRole(
        req.params.id,
        req.body.role,
        req.user._id
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  
};

module.exports = authController;