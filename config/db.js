const mongoose=require('mongoose')
const dotenv=require('dotenv')
// dotenv.config()
const URL=process.env.MONGO_URL
module.exports=async()=>{
    try{
       const conn =   await mongoose.connect(URL)
         console.log(`MongoDB Connected: ${conn.connection.host}`);
       
    }catch(err){
         console.log(err.message)
    }
}




