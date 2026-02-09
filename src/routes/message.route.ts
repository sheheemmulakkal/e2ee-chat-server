import express from "express";
import {
    sendMessageController,
    getChannelMessagesController,
    updateMessageController,
    deleteMessageController,
} from "../controllers";

const router = express.Router();

router.post("/messages", sendMessageController);
router.get("/channels/:channelId/messages", getChannelMessagesController);
router.put("/messages/:id", updateMessageController);
router.delete("/messages/:id", deleteMessageController);

export const messageRouter = router;
