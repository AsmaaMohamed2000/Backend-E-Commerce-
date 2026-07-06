const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(

    {

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        code: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: [
                "verify-email",
                "forgot-password"
            ],
            required: true
        },

        userData: {

            username: {
                type: String,
                trim: true
            },

            email: {
                type: String,
                lowercase: true,
                trim: true
            },

            password: {
                type: String
            },

            phone: {
                type: String
            },
              avatar: {
    url: {
        type: String,
        default: ""
    },
    publicId: {
        type: String,
        default: ""
    }
},

        },

        attempts: {
            type: Number,
            default: 0
        },

        expiresAt: {
            type: Date,
            required: true
        }

    },

    {
        timestamps: true
    }

);
// otpSchema.index({expiresAt:1},{expireAfterSeconds:0})

module.exports = mongoose.model("Otp", otpSchema)