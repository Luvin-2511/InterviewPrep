/**
 * @middleware authUser
 * @description Validates whether the user is valid or not using token
 */

const tokenModel = require('../models/blacktoken.model')
const jwt = require('jsonwebtoken')

async function authUser(req, res, next) {
    const {token} = req.cookies;

    if (!token) {
        return res.status(403).json({
            message: "Token not provided!",
        });
    }

    const isBlackListed = await tokenModel.findOne({
        token:token
    })

    if (isBlackListed){
        return res.status(400).json({
            message:"Invalid token !"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (e) {
        return res.status(403).json({
            message: "Unauthorized Access !"
        })
    }
}

module.exports = authUser