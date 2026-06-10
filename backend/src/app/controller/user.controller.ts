import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import userService from "../../services/user.service";
import { generateToken, verifyToken } from "../../utils/jwt.utils";
import IUser from "../interface/user.interface";

const isProd = process.env.NODE_ENV === 'production';

const register = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {username, email, password} = req.body;
    try {
        const user = await userService.registerUser({username,email,password});
        const token = generateToken(user);

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
    } catch (error: any) {
        res.status(400).json({message:error.message});
    }
});

const authenticate = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {email, password} = req.body;

    try {
        const authResult = await userService.authenticateUser({email,password});
        if(!authResult){
            res.status(400).json({message:"email or password incorrect!"});
            return;
        }

        res.cookie("auth_token",authResult.token,{
            httpOnly:true,
            maxAge:3600000,
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
            token:authResult.token
        });

    } catch (error:any) {
        console.log(error.message);
        res.status(400).json({message:"une erreur c'est produite !"});
    }
});

const checkEmailAvailability = expressAsyncHandler(async(req:Request, res:Response)=>{
    const email = req.query.email as string;
    if(!email){
        res.status(400).json({ message: 'Email is required' });
        return;
    }

    const availability = await userService.isEmailAvailable(email);
    console.log(availability);
    
    res.status(200).json(availability);
});

const logout = expressAsyncHandler(async(req:Request, res:Response)=>{
    res.clearCookie('auth_token', {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
    });
    res.status(200).json({ message: 'Logout successful' });
});

const me = expressAsyncHandler(async(req:Request, res:Response)=>{
    const { auth_token } = req.cookies;
    if(!auth_token){
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }

    try {
        const decoded: any = verifyToken(auth_token as string);
        const user = await userService.findUser(decoded._id);
        if(!user){
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
    } catch (error: any) {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

const findUser = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.params;
    try {
        const user = await userService.findUser(id as string);
        if(!user) {
            res.status(400).json({message:"User does not exist!"});
            return;
        }
        res.status(200).json(user);
    } catch (error: any) {
        console.log(error.message);
        res.status(400).json({message:'An error as occured!'});
    }
});

const updateUser = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {id}= req.params;
    const data = req.body;

    try {
        const user = await userService.update(id as string, data as IUser);
        if(!user) {
            res.status(400).json({message:"Cannot update user!"});
            return;
        }
        const updatedUser = await userService.findUser(id as string);
        if (!updatedUser) {
            res.status(400).json({message:"User not found after update"});
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
    } catch (error: any) {
        console.log(error.message);
        res.status(400).json({message:'An error as occured!'});
    }
});

const deleteUser = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.params;
    try {
        const user = await userService.deleteUser(id as string);
        if(!user) {
            res.status(400).json({message: "Cannot delete user!"});
            return;
        }
        res.status(200).json({message:"User delete successfully"});
    } catch (error: any) {
        console.log(error.message);
        res.status(400).json({message:'An error as occured!'});
    }
});

const changePassword = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.params;
    const {currentPassword, newPassword} = req.body;

    if(!currentPassword || !newPassword){
        res.status(400).json({message:"Current password and new password are required"});
        return;
    }

    try {
        const result = await userService.changePassword(id as string, currentPassword, newPassword);
        res.status(200).json(result);
    } catch (error: any) {
        console.log(error.message);
        res.status(400).json({message: error.message || 'An error occurred!'});
    }
});

const exportUserData = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.params;
    try {
        const data = await userService.exportUserData(id as string);
        res.status(200).json(data);
    } catch (error: any) {
        console.log(error.message);
        res.status(400).json({message:'An error as occured!'});
    }
});

const getPaymentMethods = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.params;
    try {
        const methods = await userService.getPaymentMethods(id as string);
        res.status(200).json(methods);
    } catch (error: any) {
        console.log(error.message);
        res.status(400).json({message:'An error as occured!'});
    }
});

const addPaymentMethod = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.params;
    const methodData = req.body;
    try {
        const methods = await userService.addPaymentMethod(id as string, methodData);
        res.status(200).json(methods);
    } catch (error: any) {
        console.log(error.message);
        res.status(400).json({message: error.message || 'An error occurred!'});
    }
});

const updatePaymentMethod = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {id, index} = req.params;
    const data = req.body;
    try {
        const methods = await userService.updatePaymentMethod(id as string, parseInt(index as string), data);
        res.status(200).json(methods);
    } catch (error: any) {
        console.log(error.message);
        res.status(400).json({message: error.message || 'An error occurred!'});
    }
});

const deletePaymentMethod = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {id, index} = req.params;
    try {
        const methods = await userService.deletePaymentMethod(id as string, parseInt(index as string));
        res.status(200).json(methods);
    } catch (error: any) {
        console.log(error.message);
        res.status(400).json({message: error.message || 'An error occurred!'});
    }
});

export {register,authenticate, checkEmailAvailability, logout, me, findUser, updateUser, deleteUser, changePassword, exportUserData, getPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod};
