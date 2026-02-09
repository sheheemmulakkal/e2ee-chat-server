import { NextFunction, Request, Response } from "express";
import * as channelService from "../../services/channel";

export const createChannelController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { organizationId, name, type, userId } = req.body;

        if (!organizationId || !name || !type || !userId) {
            throw new Error("organizationId, name, type, and userId are required");
        }

        if (type !== 'PUBLIC' && type !== 'PRIVATE') {
            throw new Error("Type must be PUBLIC or PRIVATE");
        }

        const channel = await channelService.createChannel(organizationId, name, type, userId);
        res.status(201).json({ channel });
    } catch (error) {
        next(error);
    }
};

export const getChannelController = async (
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

        const channel = await channelService.getChannel(
            parseInt(channelId as string),
            parseInt(userId as string)
        );
        res.status(200).json({ channel });
    } catch (error) {
        next(error);
    }
};

export const updateChannelController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { userId, name } = req.body;

        if (!id || !userId || !name) {
            throw new Error("id, userId, and name are required");
        }

        const channel = await channelService.updateChannel(
            parseInt(id as string),
            userId,
            name
        );
        res.status(200).json({ channel });
    } catch (error) {
        next(error);
    }
};

export const deleteChannelController = async (
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

        await channelService.deleteChannel(parseInt(id as string), userId);
        res.status(200).json({ message: "Successfully deleted channel" });
    } catch (error) {
        next(error);
    }
};
