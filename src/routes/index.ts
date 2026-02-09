import express from 'express';
import { userRouter } from './user.route';
import { organizationRouter } from './organization.route';
import { channelRouter } from './channel.route';
import { messageRouter } from './message.route';

const router = express.Router();

router.use('/users', userRouter);
router.use(organizationRouter); // Paths are defined as /organizations in the router
router.use(channelRouter);      // Paths are defined as /channels in the router
router.use(messageRouter);      // Paths are defined as /messages in the router

export const apiRouter = router;
