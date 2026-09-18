require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.route");
const cors = require('cors')
const cookieParser = require("cookie-parser");
const session = require('express-session');
const passport = require('./config/passport.config');

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}))

// Session needed briefly for passport OAuth handshake only
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.use(passport.initialize())
app.use(passport.session())

/**
 * Routes
 */
app.use("/api/auth", authRoutes);
app.use('/api/interview', interviewRouter)

module.exports = app;
