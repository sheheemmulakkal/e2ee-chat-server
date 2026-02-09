import { query } from '../../db/db';
import { Invitation } from '../../types';

const createInvitation = async (
    senderId: number,
    receiverUsername: string,
    organizationId: number
): Promise<Invitation> => {
    const sql = `
    INSERT INTO invitations (sender_id, receiver_username, organization_id, status) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *;
  `;

    const { rows } = await query(sql, [senderId, receiverUsername, organizationId, 'PENDING']);
    return rows[0];
};

const updateInvitationStatus = async (
    invitationId: number,
    status: 'ACCEPTED' | 'REJECTED'
): Promise<Invitation> => {
    const sql = `
    UPDATE invitations 
    SET status = $1, updated_at = NOW() 
    WHERE id = $2 
    RETURNING *;
  `;

    const { rows } = await query(sql, [status, invitationId]);
    return rows[0];
};

const getInvitationById = async (id: number): Promise<Invitation | null> => {
    const sql = `
    SELECT * FROM invitations 
    WHERE id = $1 AND deleted_at IS NULL;
  `;

    const { rows } = await query(sql, [id]);
    return rows[0] || null;
};

export const invitationRepository = {
    createInvitation,
    updateInvitationStatus,
    getInvitationById,
};
