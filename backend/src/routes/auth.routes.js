const {Router} = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desciption Register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController);

/** * @route POST /api/auth/login
 * @desciption Login a user
 * @access Public
 */
authRouter.post("/login", authController.loginUserController);

/**
 * @route GET /api/auth/logout
 * @desciption Logout a user, expects the token in the cookie
 * @access Public
 */
authRouter.get("/logout", authController.logoutUserController);

/**
 * @route POST /api/auth/get-me
 * @desciption Get the current logged in user
 * @access Private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController);

module.exports = authRouter;