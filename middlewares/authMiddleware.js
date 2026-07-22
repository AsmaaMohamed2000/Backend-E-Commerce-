const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const validate = (schema) => {

  return (req,res,next)=>{

    const { error, value } =
      schema.validate(req.body,{
        abortEarly:false,
        stripUnknown:true
      })

    if(error){

      return res.status(400).json({
        success:false,
        type:'validation',
        message:'validation failed',
        errors:error.details.map((err)=> (
          {message:err.message,field:err.path[0]}
        )
        )
      })
    }

    req.body = value

    next()
  }
}

const ValidateQuery= (schema) => {

  return (req,res,next)=>{

    const { error, value } =
      schema.validate({...req.query},{
        abortEarly:false,
        stripUnknown:true,convert:true
      })

    if(error){

      return res.status(400).json({
        success:false,
        type:'validation',
        message:'validation failed',
        errors:error.details.map((err)=> (
          {message:err.message,field:err.path[0]}
        )
        )
      })
    }
console.log(value)
    req.validateQuery = value
console.log(req.validateQuery )
    next()
  }
}

const auth = async (req, res, next) => {
 
  try {
    const authHeader = req.headers.authorization 
     if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
     

    const token = authHeader.split(/\s+/)[1];
   

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",err:err.stack
    });
  }
};



const adminOnly= (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: ` not authorized to access this route` });
    }
    next();
  }};
module.exports = {validate,auth,adminOnly,ValidateQuery}
