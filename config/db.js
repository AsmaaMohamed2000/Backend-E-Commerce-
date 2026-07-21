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



//123@@AAaa
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNTkzYjIxNmI5Y2Q3ZDZjOTMzOWNmNSIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJpYXQiOjE3ODQyOTg0ODMsImV4cCI6MTc4Njg5MDQ4M30.CWOHE4DFp2hBxt7NrDt8ki5BXp4vn2JIEfAM8R151mY
// // // 
// //admin
//user
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNTk0MzMxYTVlYjU5NjZjNWYxZDc5MiIsInJvbGUiOiJjdXN0b21lciIsInR5cGUiOiJhY2Nlc3NfdG9rZW4iLCJpYXQiOjE3ODQyMzQ5NzgsImV4cCI6MTc4NjgyNjk3OH0.nYKtHLaCAjCLI9zKjizRU9zFninjBRJF9JAfRKSdDh4
// //"password":"ssAA@@33"