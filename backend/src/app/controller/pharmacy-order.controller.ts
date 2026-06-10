import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import orderService from "../../services/order.service";
import { IOrder } from "../../app/interface/order.interface";
import { uploadPrescription } from "../../core/features/multer.config";

const getOrdersByUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const orders = await orderService.getOrdersByUser(userId);
    const formatted = orders.map(order => ({
        _id: order._id,
        orderReference: order.orderReference,
        userId: (order.user as any)?._id || '',
        userName: (order.user as any)?.username,
        userPhone: (order.user as any)?.phone,
        userEmail: (order.user as any)?.email,
        medications: order.medicines.map((m: any) => ({
            medicationId: m.medicine,
            medicationName: (m.medicine as any)?.name || 'Unknown',
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

const getOrders = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const orders = await orderService.getOrdersByPharmacy(pharmacyId);
    // Transform to frontend format
    const formattedOrders = orders.map(order => ({
        _id: order._id,
        orderReference: order.orderReference,
        userId: (order.user as any)?._id || '',
        userName: (order.user as any)?.username,
        userPhone: (order.user as any)?.phone,
        userEmail: (order.user as any)?.email,
        medications: order.medicines.map((m: any) => ({
            medicationId: m.medicine,
            medicationName: (m.medicine as any)?.name || 'Unknown',
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

const getOrderById = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const orderId = req.params.orderId as string;
    const order = await orderService.getOrderById(pharmacyId, orderId);
    if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
    }
    // Transform to frontend format
    const formattedOrder = {
        _id: order._id,
        orderReference: order.orderReference,
        userId: (order.user as any)?._id || '',
        userName: (order.user as any)?.username,
        userPhone: (order.user as any)?.phone,
        userEmail: (order.user as any)?.email,
        medications: order.medicines.map((m: any) => ({
            medicationId: m.medicine,
            medicationName: (m.medicine as any)?.name || 'Unknown',
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

const createOrder = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const orderData = JSON.parse(req.body.data as string);
    const prescriptionData = {
        fileName: req.file ? req.file.originalname : undefined,
        filePath: req.file ? `/uploads/${req.file.filename}` : undefined,
        status: 'pending' as const
    };
    const order = await orderService.createOrder({
        ...orderData,
        pharmacy: pharmacyId as any,
        prescription: prescriptionData.fileName ? prescriptionData : undefined
    });
    res.status(201).json(order);
  });

const updateOrderStatus = expressAsyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(orderId, status);
    if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
    }
    // Transform to frontend format
    const formattedOrder = {
        _id: order._id,
        orderReference: order.orderReference,
        userId: (order.user as any)?._id || '',
        userName: (order.user as any)?.username,
        userPhone: (order.user as any)?.phone,
        userEmail: (order.user as any)?.email,
        medications: order.medicines.map((m: any) => ({
            medicationId: m.medicine,
            medicationName: (m.medicine as any)?.name || 'Unknown',
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

const updatePrescriptionStatus = expressAsyncHandler(async (req: Request, res: Response) => {
    const orderId = req.params.orderId as string;
    const { status, notes } = req.body;
    const order = await orderService.updatePrescriptionStatus(orderId, { status, notes });
    if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
    }
    res.json({ message: 'Prescription status updated', prescription: order.prescription });
});

export { getOrders, getOrderById, createOrder, updateOrderStatus, getOrdersByUser, updatePrescriptionStatus };
