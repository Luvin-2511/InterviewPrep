const express = require('express')
const authRouter = express.Router()
const authControllers = require('../controllers/auth.controller')
const authUser = require('../middlewares/auth.middleware')
const passport = require('../config/passport.config')
const jwt = require('jsonwebtoken')

authRouter.post('/register', authControllers.registerController)
authRouter.post('/login', authControllers.loginController)
authRouter.post('/logout', authUser, authControllers.logoutController)
authRouter.get('/get-me', authUser, authControllers.getMecontroller)

// Google OAuth
authRouter.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
)

authRouter.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` }),
    (req, res) => {
        // Issue JWT and set cookie, then redirect to home
        const token = jwt.sign(
            { id: req.user._id, username: req.user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
            maxAge: 24 * 60 * 60 * 1000
        })
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/home?token=${token}`)
    }
)

module.exports = authRouter
