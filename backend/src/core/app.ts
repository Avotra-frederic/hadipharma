import express, { Request, Response } from "express"
import cors from "cors";
import userRouter from "../router/user.routes";
import pharmacyRouter from "../router/pharmacy.routes";
import adminRouter from "../router/admin.routes";
import cookieParser from "cookie-parser";
import path from "node:path";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Log and detect aborted requests from clients
app.use((req, _res, next) => {
  req.on('aborted', () => {
    console.warn(`Request aborted ${req.method} ${req.originalUrl}`);
  });
  next();
});
app.use("/uploads", express.static(path.join(__dirname, "..", "..", "uploads")));
app.use("/api/uploads", express.static(path.join(__dirname, "..", "..", "uploads")));

app.use("/api/auth", userRouter);
app.use("/api/pharmacy", pharmacyRouter);
app.use("/api/admin", adminRouter);

app.get("/",( req:Request, res:Response)=>{
    res.json({message:"Api is running"});
})

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
    console.error('Unhandled error:', err && err.stack ? err.stack : err);
    if (err && err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }
    if (err && err.code === 'ECONNRESET') {
        // client aborted, nothing to do
        return;
    }
    res.status(err?.status || 500).json({ message: err?.message || 'Internal server error' });
});

export default app