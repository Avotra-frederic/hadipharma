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
        res.status(400).json({message:error.message})
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
        console.log(error.message)
        res.status(400).json({message:"une erreur c'est produite !"})
    }
})

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
        res.status(400).json({message:'An error as occured!'})
    }
})


const updateUser = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {id}= req.params;
    const data = req.body;

    try {
        const user = await userService.update(id as string, data as IUser);
        if(!user) {
            res.status(400).json({message:"Cannot update user!"});
            return;
        }
        res.status(201).json({message:"User updated successfuly!"})
    } catch (error: any) {
        console.log(error.message);
        res.status(400).json({message:'An error as occured!'})
   }
})


const deleteUser = expressAsyncHandler(async(req:Request, res:Response)=>{
    const {id} = req.params;
    try {
        const user = await userService.deleteUser(id as string);
        if(!user) {
            res.status(400).json({message: "Cannot delete user!"});
            return;
        }
        res.status(201).json({message:"User delete successfully"});
    } catch (error: any) {
        console.log(error.message);
        res.status(400).json({message:'An error as occured!'})
    }
})

export {register,authenticate, checkEmailAvailability, logout, me, findUser, updateUser, deleteUser}