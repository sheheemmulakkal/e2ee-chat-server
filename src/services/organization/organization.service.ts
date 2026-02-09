import { organizationRepository, invitationRepository, userRepository } from '../../repositories';
import { Organization, Invitation } from '../../types';

export const createOrganization = async (
    name: string,
    ownerId: number
): Promise<Organization> => {
    // Validate user exists
    const user = await userRepository.getUserById(ownerId);
    if (!user) {
        throw new Error('User not found');
    }

    return await organizationRepository.createOrganizationWithChannels(name, ownerId);
};

export const inviteUser = async (
    senderId: number,
    receiverUsername: string,
    organizationId: number
): Promise<Invitation> => {
    // Validate sender is a member of the organization
    const senderMembership = await organizationRepository.getMemberRole(organizationId, senderId);
    if (!senderMembership) {
        throw new Error('You are not a member of this organization');
    }

    // Validate receiver exists
    const receiver = await userRepository.getUserByUsername(receiverUsername);
    if (!receiver) {
        throw new Error('User not found');
    }

    // Check if receiver is already a member
    const receiverMembership = await organizationRepository.getMemberRole(organizationId, receiver.id);
    if (receiverMembership) {
        throw new Error('User is already a member of this organization');
    }

    return await invitationRepository.createInvitation(senderId, receiverUsername, organizationId);
};

export const handleInvitation = async (
    invitationId: number,
    userId: number,
    accept: boolean
): Promise<Invitation> => {
    // Get invitation
    const invitation = await invitationRepository.getInvitationById(invitationId);
    if (!invitation) {
        throw new Error('Invitation not found');
    }

    if (invitation.status !== 'PENDING') {
        throw new Error('Invitation has already been processed');
    }

    // Validate user is the receiver
    const user = await userRepository.getUserById(userId);
    if (!user || user.username !== invitation.receiver_username) {
        throw new Error('You are not authorized to respond to this invitation');
    }

    const status = accept ? 'ACCEPTED' : 'REJECTED';
    const updatedInvitation = await invitationRepository.updateInvitationStatus(invitationId, status);

    // If accepted, add user to organization
    if (accept) {
        await organizationRepository.addMember(invitation.organization_id, userId, 'MEMBER');
    }

    return updatedInvitation;
};

export const leaveOrganization = async (
    organizationId: number,
    userId: number
): Promise<void> => {
    // Validate user is a member
    const membership = await organizationRepository.getMemberRole(organizationId, userId);
    if (!membership) {
        throw new Error('You are not a member of this organization');
    }

    // If user is OWNER, check if they are the only owner
    if (membership.role === 'OWNER') {
        const ownerCount = await organizationRepository.getOwnerCount(organizationId);
        if (ownerCount === 1) {
            throw new Error('You are the only owner. Promote another member to owner before leaving.');
        }
    }

    await organizationRepository.removeMember(organizationId, userId);
};
