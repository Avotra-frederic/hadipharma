"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePrescriptionStatus = exports.getOrdersByUser = exports.updateOrderStatus = exports.createOrder = exports.getOrderById = exports.getOrders = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const order_service_1 = __importDefault(require("../../services/order.service"));
const getOrdersByUser = (0, express_async_handler_1.default)(async (req, res) => {
    const userId = req.params.userId;
    const orders = await order_service_1.default.getOrdersByUser(userId);
    const formatted = orders.map(order => ({
        _id: order._id,
        orderReference: order.orderReference,
        userId: order.user?._id || '',
        userName: order.user?.username,
        userPhone: order.user?.phone,
        userEmail: order.user?.email,
        medications: order.medicines.map((m) => ({
            medicationId: m.medicine,
            medicationName: m.medicine?.name || 'Unknown',
            quantity: m.quantity,
            price: m.price
        })),
        total: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentReference: order.paymentReference,
        customerInfo: order.customerInfo,
        paymentDetails: order.paymentDetails,
        prescription: order.prescription,
        pharmacyId: order.pharmacy,
        createdAt: order.createdAt
    }));
    res.json(formatted);
});
exports.getOrdersByUser = getOrdersByUser;
const getOrders = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const orders = await order_service_1.default.getOrdersByPharmacy(pharmacyId);
    // Transform to frontend format
    const formattedOrders = orders.map(order => ({
        _id: order._id,
        orderReference: order.orderReference,
        userId: order.user?._id || '',
        userName: order.user?.username,
        userPhone: order.user?.phone,
        userEmail: order.user?.email,
        medications: order.medicines.map((m) => ({
            medicationId: m.medicine,
            medicationName: m.medicine?.name || 'Unknown',
            quantity: m.quantity,
            price: m.price
        })),
        total: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentReference: order.paymentReference,
        customerInfo: order.customerInfo,
        paymentDetails: order.paymentDetails,
        prescription: order.prescription,
        pharmacyId: order.pharmacy,
        createdAt: order.createdAt
    }));
    res.json(formattedOrders);
});
exports.getOrders = getOrders;
const getOrderById = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const orderId = req.params.orderId;
    const order = await order_service_1.default.getOrderById(pharmacyId, orderId);
    if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
    }
    // Transform to frontend format
    const formattedOrder = {
        _id: order._id,
        orderReference: order.orderReference,
        userId: order.user?._id || '',
        userName: order.user?.username,
        userPhone: order.user?.phone,
        userEmail: order.user?.email,
        medications: order.medicines.map((m) => ({
            medicationId: m.medicine,
            medicationName: m.medicine?.name || 'Unknown',
            quantity: m.quantity,
            price: m.price
        })),
        total: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentReference: order.paymentReference,
        customerInfo: order.customerInfo,
        paymentDetails: order.paymentDetails,
        prescription: order.prescription,
        pharmacyId: order.pharmacy,
        createdAt: order.createdAt
    };
    res.json(formattedOrder);
});
exports.getOrderById = getOrderById;
const createOrder = (0, express_async_handler_1.default)(async (req, res) => {
    const pharmacyId = req.params.pharmacyId;
    const orderData = JSON.parse(req.body.data);
    const prescriptionData = {
        fileName: req.file ? req.file.originalname : undefined,
        filePath: req.file ? `/uploads/${req.file.filename}` : undefined,
        status: 'pending'
    };
    const order = await order_service_1.default.createOrder({
        ...orderData,
        pharmacy: pharmacyId,
        prescription: prescriptionData.fileName ? prescriptionData : undefined
    });
    res.status(201).json(order);
});
exports.createOrder = createOrder;
const updateOrderStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const orderId = req.params.orderId;
    const { status } = req.body;
    const order = await order_service_1.default.updateOrderStatus(orderId, status);
    if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
    }
    // Transform to frontend format
    const formattedOrder = {
        _id: order._id,
        orderReference: order.orderReference,
        userId: order.user?._id || '',
        userName: order.user?.username,
        userPhone: order.user?.phone,
        userEmail: order.user?.email,
        medications: order.medicines.map((m) => ({
            medicationId: m.medicine,
            medicationName: m.medicine?.name || 'Unknown',
            quantity: m.quantity,
            price: m.price
        })),
        total: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentReference: order.paymentReference,
        customerInfo: order.customerInfo,
        paymentDetails: order.paymentDetails,
        prescription: order.prescription,
        pharmacyId: order.pharmacy,
        createdAt: order.createdAt
    };
    res.json(formattedOrder);
});
exports.updateOrderStatus = updateOrderStatus;
const updatePrescriptionStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const orderId = req.params.orderId;
    const { status, notes } = req.body;
    const order = await order_service_1.default.updatePrescriptionStatus(orderId, { status, notes });
    if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
    }
    res.json({ message: 'Prescription status updated', prescription: order.prescription });
});
exports.updatePrescriptionStatus = updatePrescriptionStatus;
