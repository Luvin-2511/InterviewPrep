const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({
        token: {
            type: String,
            required: [true, "Token is required"]
        }
    }, {
        timestamps: true
    }
)

const tokenModel = mongoose.model('token',tokenSchema)

module.exports = tokenModel