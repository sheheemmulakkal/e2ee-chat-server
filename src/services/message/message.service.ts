import { messageRepository, channelRepository } from '../../repositories';
import { Message } from '../../types';

export const sendMessage = async (
    channelId: number,
    userId: number,
    content: string
): Promise<Message> => {
    // Validate channel exists
    const channel = await channelRepository.getChannelById(channelId);
    if (!channel) {
        throw new Error('Channel not found');
    }

    // Security Check: Ensure user is a member of the organization
    const isMember = await channelRepository.isUserInOrganization(channel.organization_id, userId);
    if (!isMember) {
        throw new Error('You are not a member of this organization');
    }

    // If PRIVATE, ensure user is in channel_members
    if (channel.type === 'PRIVATE') {
        const isInChannel = await channelRepository.isUserInChannel(channelId, userId);
        if (!isInChannel) {
            throw new Error('You do not have access to this private channel');
        }
    }

    return await messageRepository.createMessage(channelId, userId, content);
};

export const getChannelMessages = async (
    channelId: number,
    userId: number
): Promise<any[]> => {
    // Validate channel exists
    const channel = await channelRepository.getChannelById(channelId);
    if (!channel) {
        throw new Error('Channel not found');
    }

    // Security Check: Ensure user is a member of the organization
    const isMember = await channelRepository.isUserInOrganization(channel.organization_id, userId);
    if (!isMember) {
        throw new Error('You are not a member of this organization');
    }

    // If PRIVATE, ensure user is in channel_members
    if (channel.type === 'PRIVATE') {
        const isInChannel = await channelRepository.isUserInChannel(channelId, userId);
        if (!isInChannel) {
            throw new Error('You do not have access to this private channel');
        }
    }

    return await messageRepository.getMessagesByChannel(channelId);
};

export const updateMessage = async (
    messageId: number,
    userId: number,
    content: string
): Promise<Message> => {
    const message = await messageRepository.getMessageById(messageId);
    if (!message) {
        throw new Error('Message not found');
    }

    // Check if current user is the sender
    if (message.sender_id !== userId) {
        throw new Error('You do not have permission to update this message');
    }

    return await messageRepository.updateMessage(messageId, content);
};

export const deleteMessage = async (messageId: number, userId: number): Promise<void> => {
    const message = await messageRepository.getMessageById(messageId);
    if (!message) {
        throw new Error('Message not found');
    }

    // Check if current user is the sender
    if (message.sender_id !== userId) {
        throw new Error('You do not have permission to delete this message');
    }

    await messageRepository.deleteMessage(messageId);
};
