const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password
 * @access Public
 */
async function registerUserController(req, res){
    const {username, email, password} = req.body;

    //if any of the fields are missing, return an error
    if(!username || !email || !password){
        return res.status(400).json({message: 'Please provide username, email and password'});
    }

    //check if the user already exists
    const isUserAlreadyExists = await userModel.findOne({
        $or: [{username}, {email}]
    })
    if(isUserAlreadyExists){
        return res.status(400).json({message: 'User with the same username or email already exists'});
    }

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    //create the user and save to DB
    const user = new userModel({
        username,
        email,
        password: hashedPassword
    });
    await user.save();

    //Create a JWT token for the user
    const token = jwt.sign(
        {id: user._id, username: user.username},
        process.env.JWT_SECRET, 
        {expiresIn: '1h'});
    
    //store the token in cookie
    res.cookie('token', token).status(201).json({message: 'User registered successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }    
    });
}

/**
 * @name loginUserController
 * @description login a user, expects email and password
 * @access Public
 */
async function loginUserController(req, res){
    const {email, password} = req.body;

    //search for the user by email in DB, if not found return an error
    const user = await userModel.findOne({email});

    if(!user){
        return res.status(400).json({message: 'Invalid email or password'});
    }

    //compare curr. password with the hashed password in DB, if not match return an error
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(400).json({message: 'Invalid email or password'});
    }

    //Create a JWT token for the user
    const token = jwt.sign(
        {id: user._id, username: user.username},
        process.env.JWT_SECRET, 
        {expiresIn: '1h'}
    );
    //store the token in cookie
    res.cookie('token', token).status(200).json({message: 'User logged in successfully',
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }    
    });
}

/**
 * @name logoutUserController
 * @description logout a user, expects the token in the cookie, adds the token to blacklist
 * @access Public
 */
async function logoutUserController(req, res){
    const token = req.cookies.token;

    //if token is present, add it to blacklist 
    if(token){
        await tokenBlacklistModel.create({ token });
    }
    //clear the cookie
    res.clearCookie('token').status(200).json({message: 'User logged out successfully'});
}

/**
 * @name getMeController
 * @description get the current logged in user details
 * @access Private
 */
async function getMeController(req, res){
    const user = await userModel.findById(req.user.id);
    res.status(200).json({
        message: 'User details fetched successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

module.exports = { registerUserController, loginUserController, logoutUserController, getMeController };