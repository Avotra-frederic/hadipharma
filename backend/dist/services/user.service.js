"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../app/model/user.model"));
const jwt_utils_1 = require("../utils/jwt.utils");
class UserService {
    async registerUser(data) {
        const { username, email, password } = data;
        try {
            const existingUser = await user_model_1.default.findOne({ email });
            if (existingUser) {
                throw new Error("User already exists!");
            }
            const hashpassword = await bcryptjs_1.default.hash(password, 10);
            const user = await user_model_1.default.create({ username, email, password: hashpassword });
            return user;
        }
        catch (error) {
            throw new Error("An error is occured! " + error);
        }
    }
    async isEmailAvailable(email) {
        const existingUser = await user_model_1.default.findOne({ email });
        return { available: !Boolean(existingUser) };
    }
    async authenticateUser(credentials) {
        const { email, password } = credentials;
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            return null;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return null;
        }
        const token = (0, jwt_utils_1.generateToken)(user);
        return { user, token };
    }
    /**
     * update
     */
    async update(id, data) {
        const user = await user_model_1.default.findByIdAndUpdate(id, data);
        if (user)
            return true;
        return false;
    }
    /**
     * findUser
     */
    async findUser(id) {
        try {
            const user = await user_model_1.default.findById(id);
            if (user)
                return user;
            return null;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    /**
     * deleteUser
     */
    async deleteUser(id) {
        try {
            const user = await user_model_1.default.findByIdAndDelete(id);
            if (!user)
                return null;
            return user;
        }
        catch (error) {
            throw new Error(error);
        }
    }
}
exports.default = new UserService();
