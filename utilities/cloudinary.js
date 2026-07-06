const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {

    console.log("before upload_stream");

    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {

        console.log("callback called");

        if (error) {
          console.log("Cloudinary Error:", error);
          return reject(error);
        }

        console.log("Result:", result);

        resolve(result);
      }
    );

    console.log("before pipe");

    streamifier.createReadStream(fileBuffer).pipe(stream);

    console.log("after pipe");
  });
};

module.exports = uploadToCloudinary;