/**
 * @middleware authUser
 * @description Validates whether the user is valid or not using token or Authorization header
 */

const tokenModel = require('../models/blacktoken.model')
const jwt = require('jsonwebtoken')

async function authUser(req, res, next) {
    let token = req.cookies?.token;
    
    // Check Authorization: Bearer <token> header for cross-domain support (Vercel -> Render)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            message: "Token not provided!",
        });
    }

    const isBlackListed = await tokenModel.findOne({
        token: token
    })

    if (isBlackListed){
        return res.status(401).json({
            message:"Invalid token !"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (e) {
        return res.status(401).json({
            message: "Unauthorized Access !"
        })
    }
}

module.exports = authUser
