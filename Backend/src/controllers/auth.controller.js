const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenModel = require('../models/blacktoken.model')

/**
 *
 * @route POST api/auth/register
 * @description Registers a user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function registerController(req, res) {
    const {username, email, password} = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please fill all the details correctly!",
        });
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            {
                username: username,
            },
            {
                email: email,
            },
        ],
    });

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: `User with ${isUserAlreadyExists.email === email ? "email" : "username"} already exists`,
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword,
    });

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        },
    );

    res.cookie("token", token);

    res.status(201).json({
        message: "User created successfully",
        user: {
            username,
            email,
        },
    });
}

/**
 *
 * @route POST api/auth/login
 * @description Logins a user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function loginController(req, res) {
    const {username, email, password} = req.body;

    if ((!username && !email) || !password) {
        return res.status(400).json({
            message: "Enter a password !",
        });
    }

    const user = await userModel
        .findOne({
            $or: [
                {
                    username: username,
                },
                {
                    email: email,
                },
            ],
        })
        .select("+password");

    if (!user) {
        return res.status(404).json({
            message: "User doesn't exist",
        });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return res.status(403).json({
            message: "Invalid Credentials !",
        });
    }

    const token = jwt.sign(
        {
            username: user.username,
            id: user._id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d",
        },
    );

    res.cookie("token", token);

    return res.status(201).json({
        message: "Logged in successfully !",
        user,
    });
}

/**
 * @route POST api/auth/logout
 * @description Logouts an uer
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function logoutController(req, res) {
    const {token} = req.cookies
    const blackList = await tokenModel.create({
        token: token
    })
    res.clearCookie("token")

    return res.status(200).json({
        message: "User logout successfully!",
        blackList
    })
}

async function getMecontroller(req, res) {
    const {username} = req.user
    const user = await userModel.findOne({
        username: username
    })
    if (!user) {
        return res.status(404).json({
            message: "Invalid user"
        })
    }
    return res.status(200).json({
        message: "User fetched successfully !",
        user
    })
}

module.exports = {
    registerController,
    loginController,
    logoutController,
    getMecontroller
};
