import { NextFunction, Request, Response } from "express";
import * as messageService from "../../services/message";

export const sendMessageController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { channelId, userId, content } = req.body;

        if (!channelId || !userId || !content) {
            throw new Error("channelId, userId, and content are required");
        }

        const message = await messageService.sendMessage(channelId, userId, content);
        res.status(201).json({ message });
    } catch (error) {
        next(error);
    }
};

export const getChannelMessagesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { channelId } = req.params;
        const { userId } = req.query; // Assuming userId comes from query for GET request validation

        if (!channelId || !userId) {
            throw new Error("channelId and userId are required");
        }

        const messages = await messageService.getChannelMessages(
            parseInt(channelId as string),
            parseInt(userId as string)
        );
        res.status(200).json({ messages });
    } catch (error) {
        next(error);
    }
};

export const updateMessageController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { userId, content } = req.body;

        if (!id || !userId || !content) {
            throw new Error("id, userId, and content are required");
        }

        const message = await messageService.updateMessage(
            parseInt(id as string),
            userId,
            content
        );
        res.status(200).json({ message });
    } catch (error) {
        next(error);
    }
};

export const deleteMessageController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // For permission check

        if (!id || !userId) {
            throw new Error("id and userId are required");
        }

        await messageService.deleteMessage(parseInt(id as string), userId);
        res.status(200).json({ message: "Successfully deleted message" });
    } catch (error) {
        next(error);
    }
};
