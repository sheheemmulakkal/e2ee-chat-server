import express from "express";
import {
    createOrganizationController,
    inviteUserController,
    handleInvitationController,
    leaveOrganizationController,
} from "../controllers";

const router = express.Router();

router.post("/organizations", createOrganizationController);
router.post("/organizations/invite", inviteUserController);
router.put("/organizations/invitations/:id", handleInvitationController);
router.delete("/organizations/:orgId/members/me", leaveOrganizationController);

export const organizationRouter = router;
