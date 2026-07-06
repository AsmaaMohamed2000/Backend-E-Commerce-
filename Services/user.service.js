const User = require('../models/user.model')
const uploade=require('../middlewares/uploads')
const cloudinary=require('../config/cloudinary')
const uploadCloudinary=require('../utilities/cloudinary')
const userService={
addUser : async (data) => {
  
    const { username, email, password, phone, role,addresses } = data;

    const user = await User.findOne({ email });

    if (user) {
     throw new Error('email already exist')
    }

    const newUser = await User.create({
      username,
      email,
      password,
      phone,
      role,
      addresses,
      isVerified: true,
    });

    return {
         success: true,
      message: "User created successfully",
      data: newUser,
    }
  
},




getAllUsersService: async ({
  page = 1,
  limit = 10,
  search = "",
  sort = "-createdAt",
  role = "",
  
}) => {
  const match = {};

  if (search) {
    match.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    match.role = role;
  }

  const pipeline = [];

  pipeline.push({ $match: match });

  const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
  const sortOrder = sort.startsWith("-") ? -1 : 1;

  pipeline.push({
    $sort: {
      [sortField]: sortOrder,
    },
  });

  pipeline.push({
    $skip: (page - 1) * limit,
  });

  pipeline.push({
    $limit: limit,
  });

  pipeline.push({
    $project: {
      password: 0,
      refreshToken: 0,
       resetPasswordToken:0,
    resetPasswordExpire:0,tokens:0
    },
  });
console.log("bef")
  const users = await User.aggregate(pipeline);
console.log("aft")
  const total = await User.countDocuments(match);

  return {
    users,
    total,
  };
},

getUserByIdService : async (id) => {
  const user = await User.findById(id).select(
    "-password -tokens -resetPasswordToken -resetPasswordExpire -__v"
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
},
deleteUserService :async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  await User.findByIdAndDelete(id);

  return {
    success: true,
    message: "User deleted successfully",
  };
},
updateUser : async (req) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        throw new Error("User not found")
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = req.user.id.toString() === user._id.toString();

    if (!isAdmin && !isOwner) {
         throw new Error("Unauthorized")
        
    }

    const updates = {};

    ["username", "phone"].forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    if (isAdmin) {

        ["role", "isVerified"].forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

    }

    // Avatar
    if (req.file) {

        if (user.avatar.publicId) {
            await cloudinary.uploader.destroy(user.avatar.publicId);
        }

        const image = await uploadCloudinary(req.file.buffer,'users');

        updates.avatar = {
            url: image.secure_url,
            publicId: image.public_id
        };

    }

    // Addresses
    if (Array.isArray(req.body.addresses)) {

        const defaultCount = req.body.addresses.filter(
            address => address.isDefault
        ).length;

        if (defaultCount > 1) {
            throw new AppError(
                "Only one default address is allowed",
                400
            );
        }

        updates.addresses = req.body.addresses;
    }

    Object.assign(user, updates);

    await user.save();

    return req.user.username;

}

}
module.exports=userService
