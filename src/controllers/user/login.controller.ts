import { NextFunction, Request, Response } from "express";
import { loginService } from "../../services";

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new Error("Username and password are required");
        }

        const user = await loginService(username, password);
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
}