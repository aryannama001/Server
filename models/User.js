const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter the Name"]
    },
    email: {
        type: String,
        required: [true, "please enter email"],
        unique: true,
        validate: [validator.isEmail, "please enter correct email"]
    },
    password: {
        type: String,
        required: [true, "please enter password"],
        minLength: [6, "Password should be greater than 6 characters"],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    }


}, {
    timestamps: true
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.generateToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

userSchema.methods.comparePassword = async function (pass) {
    return await bcrypt.compare(pass, this.password)
}

module.exports = mongoose.model("User", userSchema)