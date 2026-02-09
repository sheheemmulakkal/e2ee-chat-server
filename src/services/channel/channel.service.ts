import { channelRepository } from '../../repositories';
import { Channel } from '../../types';

export const createChannel = async (
    organizationId: number,
    name: string,
    type: 'PUBLIC' | 'PRIVATE',
    userId: number
): Promise<Channel> => {
    // Validate user is a member of the organization
    const isMember = await channelRepository.isUserInOrganization(organizationId, userId);
    if (!isMember) {
        throw new Error('You are not a member of this organization');
    }

    // Create the channel
    const channel = await channelRepository.createChannel(organizationId, name, type, userId);

    // If PRIVATE, add the creator to channel_members
    if (type === 'PRIVATE') {
        await channelRepository.addChannelMember(channel.id, userId);
    }

    return channel;
};

export const getChannel = async (channelId: number, userId: number): Promise<Channel> => {
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

    return channel;
};

export const updateChannel = async (
    channelId: number,
    userId: number,
    name: string
): Promise<Channel> => {
    const channel = await channelRepository.getChannelById(channelId);
    if (!channel) {
        throw new Error('Channel not found');
    }

    // Check if user is Admin/Owner OR the creator
    const userRole = await channelRepository.getUserRole(channel.organization_id, userId);
    const isCreator = channel.created_by === userId;
    const isAdminOrOwner = userRole === 'OWNER';

    if (!isCreator && !isAdminOrOwner) {
        throw new Error('You do not have permission to update this channel');
    }

    return await channelRepository.updateChannel(channelId, name);
};

export const deleteChannel = async (channelId: number, userId: number): Promise<void> => {
    const channel = await channelRepository.getChannelById(channelId);
    if (!channel) {
        throw new Error('Channel not found');
    }

    // Check if user is Admin/Owner OR the creator
    const userRole = await channelRepository.getUserRole(channel.organization_id, userId);
    const isCreator = channel.created_by === userId;
    const isAdminOrOwner = userRole === 'OWNER';

    if (!isCreator && !isAdminOrOwner) {
        throw new Error('You do not have permission to delete this channel');
    }

    await channelRepository.deleteChannel(channelId);
};
