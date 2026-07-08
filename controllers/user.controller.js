const userService = require("../Services/user.service")

const userController={
    addUser:async(req,res)=>{
        try{
            const result=await userService.addUser(req.body)
            res.status(201).json(result)
        }catch(err){
            res.status(500).json({
                success:false,
                message:err.stack
            })
        }
    },

getUsers : async (req, res) => {
    console.log("bef")
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const isVerified = req.query.isVerified ;
    const sort = req.query.sort || "-createdAt";

    const { users, totalFilteredUsers } = await userService.getAllUsersService(
    {  page,
      limit,
      search,
      sort,
      role,
    isVerified}
    );

    res.status(200).json({
      success: true,
      totalFilteredUsers,
      page,
      pages: Math.ceil(totalFilteredUsers / limit),
      countReturned: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
},


getUser :async (req, res) => {
  try {
    const user = await userService.getUserByIdService(req.params.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
},
deleteUser : async (req, res) => {
  try {
    const result = await userService.deleteUserService(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
},
updateUser : async (req, res, next) => {
  try {

    const user = await userService.updateUser(req);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });

  } catch (error) {
   res.status(400).json({
    message:error.message
   })
  }
}
,

changePassword: async (req, res) => {
  console.log('hhhhhhhhhhhhhhhhh')
    try {

        const result = await userService.changePassword(req.user.id,req.body);

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
            data: result
        });

    } catch (error) {
        res.status(400).json({
          success:false,
          message:error.message
        })
    }
}

}
module.exports=userController