"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.addAddress = exports.getAddresses = exports.toggleFavorite = exports.getFavorites = exports.uploadUserPhoto = exports.deletePaymentMethod = exports.updatePaymentMethod = exports.addPaymentMethod = exports.getPaymentMethods = exports.exportUserData = exports.changePassword = exports.deleteUser = exports.updateUser = exports.findUser = exports.me = exports.logout = exports.checkEmailAvailability = exports.authenticate = exports.register = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const user_service_1 = __importDefault(require("../../services/user.service"));
const jwt_utils_1 = require("../../utils/jwt.utils");
const user_model_1 = __importDefault(require("../model/user.model"));
const pharmacy_model_1 = __importDefault(require("../model/pharmacy.model"));
const notification_service_1 = require("../../services/notification.service");
const medicine_model_1 = __importDefault(require("../model/medicine.model"));
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
        const pharmacy = await pharmacy_model_1.default.findOne({ user_id: user._id });
        if (pharmacy) {
            await (0, notification_service_1.ensureSubscriptionExpiryAlert)(user._id.toString(), pharmacy);
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
        const updatedUser = await user_service_1.default.findUser(id);
        if (!updatedUser) {
            res.status(400).json({ message: "User not found after update" });
            return;
        }
        res.status(200).json({
            message: "User updated successfully",
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                photo: updatedUser.photo || null,
            },
        });
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
        res.status(200).json({ message: "User delete successfully" });
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: 'An error as occured!' });
    }
});
exports.deleteUser = deleteUser;
const changePassword = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        res.status(400).json({ message: "Current password and new password are required" });
        return;
    }
    try {
        const result = await user_service_1.default.changePassword(id, currentPassword, newPassword);
        res.status(200).json(result);
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message || 'An error occurred!' });
    }
});
exports.changePassword = changePassword;
const exportUserData = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    try {
        const data = await user_service_1.default.exportUserData(id);
        res.status(200).json(data);
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: 'An error as occured!' });
    }
});
exports.exportUserData = exportUserData;
const getPaymentMethods = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    try {
        const methods = await user_service_1.default.getPaymentMethods(id);
        res.status(200).json(methods);
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: 'An error as occured!' });
    }
});
exports.getPaymentMethods = getPaymentMethods;
const addPaymentMethod = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const methodData = req.body;
    try {
        const methods = await user_service_1.default.addPaymentMethod(id, methodData);
        res.status(200).json(methods);
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message || 'An error occurred!' });
    }
});
exports.addPaymentMethod = addPaymentMethod;
const updatePaymentMethod = (0, express_async_handler_1.default)(async (req, res) => {
    const { id, index } = req.params;
    const data = req.body;
    try {
        const methods = await user_service_1.default.updatePaymentMethod(id, parseInt(index), data);
        res.status(200).json(methods);
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message || 'An error occurred!' });
    }
});
exports.updatePaymentMethod = updatePaymentMethod;
const deletePaymentMethod = (0, express_async_handler_1.default)(async (req, res) => {
    const { id, index } = req.params;
    try {
        const methods = await user_service_1.default.deletePaymentMethod(id, parseInt(index));
        res.status(200).json(methods);
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message || 'An error occurred!' });
    }
});
exports.deletePaymentMethod = deletePaymentMethod;
const uploadUserPhoto = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    try {
        const user = await user_model_1.default.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const filename = req.file?.filename;
        if (!filename) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        user.photo = `/uploads/${filename}`;
        await user.save();
        res.status(200).json({
            message: "Photo uploaded successfully",
            photo: user.photo
        });
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message || 'An error occurred!' });
    }
});
exports.uploadUserPhoto = uploadUserPhoto;
const getFavorites = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await user_model_1.default.findById(req.params.id).populate({ path: 'favoriteMedicines', populate: { path: 'pharmacy', select: 'name' } });
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.json({ favorites: user.favoriteMedicines || [] });
});
exports.getFavorites = getFavorites;
const toggleFavorite = (0, express_async_handler_1.default)(async (req, res) => {
    const medicine = await medicine_model_1.default.findById(req.params.medicineId);
    const user = await user_model_1.default.findById(req.params.id);
    if (!medicine || !user) {
        res.status(404).json({ message: 'Utilisateur ou médicament introuvable' });
        return;
    }
    const ids = (user.favoriteMedicines || []).map((id) => id.toString());
    const index = ids.indexOf(medicine._id.toString());
    if (index >= 0)
        ids.splice(index, 1);
    else
        ids.push(medicine._id.toString());
    user.favoriteMedicines = ids;
    await user.save();
    res.json({ favorite: index < 0, favorites: ids });
});
exports.toggleFavorite = toggleFavorite;
const getAddresses = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await user_model_1.default.findById(req.params.id).select('deliveryAddresses');
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.json({ addresses: user.deliveryAddresses || [] });
});
exports.getAddresses = getAddresses;
const addAddress = (0, express_async_handler_1.default)(async (req, res) => {
    const { title, address, city, phone, isDefault } = req.body;
    if (!title?.trim() || !address?.trim()) {
        res.status(400).json({ message: 'Le titre et l’adresse sont requis' });
        return;
    }
    const user = await user_model_1.default.findById(req.params.id);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    const addresses = user.deliveryAddresses || [];
    if (isDefault)
        addresses.forEach((item) => item.isDefault = false);
    addresses.push({ title: title.trim(), address: address.trim(), city, phone, isDefault: Boolean(isDefault) || addresses.length === 0 });
    user.deliveryAddresses = addresses;
    await user.save();
    res.status(201).json({ addresses });
});
exports.addAddress = addAddress;
const deleteAddress = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await user_model_1.default.findById(req.params.id);
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    const addresses = (user.deliveryAddresses || []).filter((item) => item._id.toString() !== req.params.addressId);
    user.deliveryAddresses = addresses;
    await user.save();
    res.json({ addresses });
});
exports.deleteAddress = deleteAddress;
