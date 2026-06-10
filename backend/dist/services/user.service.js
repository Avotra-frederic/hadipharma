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
    /**
     * Change password
     */
    async changePassword(id, currentPassword, newPassword) {
        const user = await user_model_1.default.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new Error("Current password is incorrect");
        }
        const hashpassword = await bcryptjs_1.default.hash(newPassword, 10);
        await user_model_1.default.findByIdAndUpdate(id, { password: hashpassword });
        return { message: "Password updated successfully" };
    }
    /**
     * Export user data
     */
    async exportUserData(id) {
        const user = await user_model_1.default.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        const userObject = user.toObject();
        const { password, ...safeUser } = userObject;
        return {
            exportedAt: new Date().toISOString(),
            user: safeUser
        };
    }
    /**
     * Add payment method
     */
    async addPaymentMethod(userId, method) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const methods = user.paymentMethods || [];
        if (methods.length === 0) {
            method.isDefault = true;
        }
        methods.push(method);
        user.paymentMethods = methods;
        await user.save();
        return user.paymentMethods;
    }
    /**
     * Update payment method
     */
    async updatePaymentMethod(userId, methodIndex, data) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const methods = user.paymentMethods || [];
        if (methodIndex < 0 || methodIndex >= methods.length) {
            throw new Error("Payment method not found");
        }
        if (data.isDefault) {
            methods.forEach((m) => m.isDefault = false);
        }
        methods[methodIndex] = { ...methods[methodIndex], ...data };
        user.paymentMethods = methods;
        await user.save();
        return user.paymentMethods;
    }
    /**
     * Delete payment method
     */
    async deletePaymentMethod(userId, methodIndex) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const methods = user.paymentMethods || [];
        if (methodIndex < 0 || methodIndex >= methods.length) {
            throw new Error("Payment method not found");
        }
        const wasDefault = methods[methodIndex].isDefault;
        methods.splice(methodIndex, 1);
        if (wasDefault && methods.length > 0) {
            methods[0].isDefault = true;
        }
        user.paymentMethods = methods;
        await user.save();
        return user.paymentMethods;
    }
    /**
     * Get payment methods
     */
    async getPaymentMethods(userId) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return (user.paymentMethods || []);
    }
}
exports.default = new UserService();
