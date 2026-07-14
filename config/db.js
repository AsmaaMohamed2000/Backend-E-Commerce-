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
// {
//     "newPassword":"aaAA@@22"


//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNTMwZWE3ZmUzNGRiN2U4MTA3Njk3MiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4Mzg3MTQ5NiwiZXhwIjoxNzg2NDYzNDk2fQ.Lc0TCoTj3Cj7jK8Ivs3t3uqA9htHES_B80hkMPpYMpQ
//admin
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNTMwZWE3ZmUzNGRiN2U4MTA3Njk3MiIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc4MzgyODE4MSwiZXhwIjoxNzg2NDIwMTgxfQ.rmUONZGK8P7DTTx56JqYEA31coOw6yOhEL140nGlLpU
// "password":"aaAA@@32"