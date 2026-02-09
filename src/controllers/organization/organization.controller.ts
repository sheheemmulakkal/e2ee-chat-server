import { NextFunction, Request, Response } from "express";
import * as organizationService from "../../services/organization";

export const createOrganizationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, ownerId } = req.body;

        if (!name || !ownerId) {
            throw new Error("Name and ownerId are required");
        }

        const organization = await organizationService.createOrganization(name, ownerId);
        res.status(201).json({ organization });
    } catch (error) {
        next(error);
    }
};

export const inviteUserController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { senderId, username, organizationId } = req.body;

        if (!senderId || !username || !organizationId) {
            throw new Error("senderId, username, and organizationId are required");
        }

        const invitation = await organizationService.inviteUser(senderId, username, organizationId);
        res.status(201).json({ invitation });
    } catch (error) {
        next(error);
    }
};

export const handleInvitationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { userId, accept } = req.body;

        if (!id || !userId || accept === undefined) {
            throw new Error("id, userId and accept are required");
        }

        const invitation = await organizationService.handleInvitation(
            parseInt(id as string),
            userId,
            accept
        );
        res.status(200).json({ invitation });
    } catch (error) {
        next(error);
    }
};

export const leaveOrganizationController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { orgId } = req.params;
        const { userId } = req.body;

        if (!orgId || !userId) {
            throw new Error("orgId and userId are required");
        }

        await organizationService.leaveOrganization(parseInt(orgId as string), userId);
        res.status(200).json({ message: "Successfully left organization" });
    } catch (error) {
        next(error);
    }
};
