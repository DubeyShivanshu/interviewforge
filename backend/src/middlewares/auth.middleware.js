const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

async function authUser(req, res, next){
    //const token = req.cookies.token;
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    //if token is not present, return unauthorized error
    if(!token){
        return res.status(401).json({message: 'Unauthorized, token is not provided'});
    }

    //check if the token is blacklisted
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({token});
    if(isTokenBlacklisted){
        return res.status(401).json({message: 'Unauthorized, token is invalid'});
    }

    //if token is present, verify it and attach user info to request object
    try{
        //verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //attach the user info to the request object
        req.user = decoded;

        //proceed to the next middleware or route handler
        next();
    }
    catch(err){
        //if token is invalid or expired, return unauthorized error
        return res.status(401).json({message: 'Unauthorized, invalid token'});
    }
}

module.exports = { authUser };