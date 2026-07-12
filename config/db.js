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

// {
//     "email":"asmaamohamedali56@gmail.com",
//     {
//  "currentPassword" : "aaAA23@#",
//   "newPassword": "aaAA23@#a"

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNDkyN2Q1MTJkYWMxYmJjYzQ2NWQ0YyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4MzM0MDQ5NCwiZXhwIjoxNzg1OTMyNDk0fQ.m_K_YzhpNEJq1ImZh38-doo45NwuRGVtzPvMyZ41YJc

//admin
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNTMwZWE3ZmUzNGRiN2U4MTA3Njk3MiIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc4MzgyODE4MSwiZXhwIjoxNzg2NDIwMTgxfQ.rmUONZGK8P7DTTx56JqYEA31coOw6yOhEL140nGlLpU
// "password":"aaAA@@32",