import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import orderService from "../../services/order.service";
import { IOrder } from "../../app/interface/order.interface";

const getOrdersByUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId as string;
    const orders = await orderService.getOrdersByUser(userId);
    const formatted = orders.map(order => ({
        _id: order._id,
        userId: (order.user as any)?._id || '',
        userName: (order.user as any)?.username,
        userPhone: (order.user as any)?.phone,
        medications: order.medicines.map((m: any) => ({
            medicationId: m.medicine,
            medicationName: (m.medicine as any)?.name || 'Unknown',
            quantity: m.quantity,
            price: m.price
        })),
        total: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
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
        userId: (order.user as any)?._id || '',
        userName: (order.user as any)?.username,
        userPhone: (order.user as any)?.phone,
        medications: order.medicines.map((m: any) => ({
            medicationId: m.medicine,
            medicationName: (m.medicine as any)?.name || 'Unknown',
            quantity: m.quantity,
            price: m.price
        })),
        total: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
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
        userId: (order.user as any)?._id || '',
        userName: (order.user as any)?.username,
        userPhone: (order.user as any)?.phone,
        medications: order.medicines.map((m: any) => ({
            medicationId: m.medicine,
            medicationName: (m.medicine as any)?.name || 'Unknown',
            quantity: m.quantity,
            price: m.price
        })),
        total: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        pharmacyId: order.pharmacy,
        createdAt: order.createdAt
    };
    res.json(formattedOrder);
});

const createOrder = expressAsyncHandler(async (req: Request, res: Response) => {
    const pharmacyId = req.params.pharmacyId as string;
    const orderData = req.body as IOrder;
    const order = await orderService.createOrder({
        ...orderData,
        pharmacy: pharmacyId as any
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
        userId: (order.user as any)?._id || '',
        userName: (order.user as any)?.username,
        userPhone: (order.user as any)?.phone,
        medications: order.medicines.map((m: any) => ({
            medicationId: m.medicine,
            medicationName: (m.medicine as any)?.name || 'Unknown',
            quantity: m.quantity,
            price: m.price
        })),
        total: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        pharmacyId: order.pharmacy,
        createdAt: order.createdAt
    };
    res.json(formattedOrder);
});

export { getOrders, getOrderById, createOrder, updateOrderStatus, getOrdersByUser };