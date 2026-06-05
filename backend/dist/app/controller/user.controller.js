"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.findUser = exports.me = exports.logout = exports.checkEmailAvailability = exports.authenticate = exports.register = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_service_1 = __importDefault(require("../../services/user.service"));
const jwt_utils_1 = require("../../utils/jwt.utils");
const isProd = process.env.NODE_ENV === 'production';
const register = (0, express_async_handler_1.default)(async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await user_service_1.default.registerUser({ username, email, password });
        const token = (0, jwt_utils_1.generateToken)(user);
        res.cookie("auth_token", token, {
            httpOnly: true,
            maxAge: 3600000,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
        });
        res.status(201).json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            token
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.register = register;
const authenticate = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    try {
        const authResult = await user_service_1.default.authenticateUser({ email, password });
        if (!authResult) {
            res.status(400).json({ message: "email or password incorrect!" });
            return;
        }
        res.cookie("auth_token", authResult.token, {
            httpOnly: true,
            maxAge: 3600000,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
        });
        res.status(200).json({
            user: {
                _id: authResult.user._id,
                username: authResult.user.username,
                email: authResult.user.email,
                role: authResult.user.role,
                photo: authResult.user.photo || null,
            },
            token: authResult.token
        });
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: "une erreur c'est produite !" });
    }
});
exports.authenticate = authenticate;
const checkEmailAvailability = (0, express_async_handler_1.default)(async (req, res) => {
    const email = req.query.email;
    if (!email) {
        res.status(400).json({ message: 'Email is required' });
        return;
    }
    const availability = await user_service_1.default.isEmailAvailable(email);
    console.log(availability);
    res.status(200).json(availability);
});
exports.checkEmailAvailability = checkEmailAvailability;
const logout = (0, express_async_handler_1.default)(async (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
    });
    res.status(200).json({ message: 'Logout successful' });
});
exports.logout = logout;
const me = (0, express_async_handler_1.default)(async (req, res) => {
    const { auth_token } = req.cookies;
    if (!auth_token) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    try {
        const decoded = (0, jwt_utils_1.verifyToken)(auth_token);
        const user = await user_service_1.default.findUser(decoded._id);
        if (!user) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        res.status(200).json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                photo: user.photo || null,
            },
            token: auth_token
        });
    }
    catch (error) {
        res.status(401).json({ message: 'Not authenticated' });
    }
});
exports.me = me;
const findUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    try {
        const user = await user_service_1.default.findUser(id);
        if (!user) {
            res.status(400).json({ message: "User does not exist!" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: 'An error as occured!' });
    }
});
exports.findUser = findUser;
const updateUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const user = await user_service_1.default.update(id, data);
        if (!user) {
            res.status(400).json({ message: "Cannot update user!" });
            return;
        }
        res.status(201).json({ message: "User updated successfuly!" });
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: 'An error as occured!' });
    }
});
exports.updateUser = updateUser;
const deleteUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    try {
        const user = await user_service_1.default.deleteUser(id);
        if (!user) {
            res.status(400).json({ message: "Cannot delete user!" });
            return;
        }
        res.status(201).json({ message: "User delete successfully" });
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: 'An error as occured!' });
    }
});
exports.deleteUser = deleteUser;
