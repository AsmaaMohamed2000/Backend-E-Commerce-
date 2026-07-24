// const mongoose=require('mongoose')
// const dotenv=require('dotenv')
// const URL=process.env.MONGO_URL
// module.exports=async()=>{
//     try{
//        const conn =   await mongoose.connect(URL)
//          console.log(`MongoDB Connected: ${conn.connection.host}`);
       
//     }catch(err){
//          console.log(err.message)
//     }
// }



// "password":"aaAA@@12"
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNTkzYjIxNmI5Y2Q3ZDZjOTMzOWNmNSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJpYXQiOjE3ODQ4NTIzNjgsImV4cCI6MTc4NzQ0NDM2OH0.SVQfIIAP9VVKeBBBAqpx3Oje9RF5YhP8x_1jHbCWxpA
// // // // 
// //admin
//user
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNTk0MzMxYTVlYjU5NjZjNWYxZDc5MiIsInJvbGUiOiJjdXN0b21lciIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJpYXQiOjE3ODQyMzQ5NzgsImV4cCI6MTc4NjgyNjk3OH0.nYKtHLaCAjCLI9zKjizRU9zFninjBRJF9JAfRKSdDh4
// //"password":"ssAA@@33"



const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null
  };
}


const connectDB = async () => {

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URL);
  }

  cached.conn = await cached.promise;

  console.log("MongoDB connected");

  return cached.conn;
};


module.exports = connectDB;