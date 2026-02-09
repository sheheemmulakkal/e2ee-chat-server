import express from "express";
import {
    createChannelController,
    getChannelController,
    updateChannelController,
    deleteChannelController,
} from "../controllers";

const router = express.Router();

router.post("/channels", createChannelController);
router.get("/channels/:channelId", getChannelController);
router.put("/channels/:id", updateChannelController);
router.delete("/channels/:id", deleteChannelController);

export const channelRouter = router;
