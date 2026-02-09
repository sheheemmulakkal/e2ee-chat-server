import { query } from '../../db/db';
import { Channel } from '../../types';

const createChannel = async (
    organizationId: number,
    name: string,
    type: 'PUBLIC' | 'PRIVATE',
    createdBy: number
): Promise<Channel> => {
    const sql = `
    INSERT INTO channels (organization_id, name, type, created_by) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *;
  `;

    const { rows } = await query(sql, [organizationId, name, type, createdBy]);
    return rows[0];
};

const addChannelMember = async (channelId: number, userId: number): Promise<void> => {
    const sql = `
    INSERT INTO channel_members (channel_id, user_id) 
    VALUES ($1, $2);
  `;

    await query(sql, [channelId, userId]);
};

const getChannelById = async (id: number): Promise<Channel | null> => {
    const sql = `
    SELECT * FROM channels 
    WHERE id = $1 AND deleted_at IS NULL;
  `;

    const { rows } = await query(sql, [id]);
    return rows[0] || null;
};

const isUserInChannel = async (channelId: number, userId: number): Promise<boolean> => {
    const sql = `
    SELECT COUNT(*) as count FROM channel_members 
    WHERE channel_id = $1 AND user_id = $2 AND deleted_at IS NULL;
  `;

    const { rows } = await query(sql, [channelId, userId]);
    return parseInt(rows[0].count) > 0;
};

const isUserInOrganization = async (organizationId: number, userId: number): Promise<boolean> => {
    const sql = `
    SELECT COUNT(*) as count FROM organization_members 
    WHERE organization_id = $1 AND user_id = $2 AND deleted_at IS NULL;
  `;

    const { rows } = await query(sql, [organizationId, userId]);
    return parseInt(rows[0].count) > 0;
};

const updateChannel = async (id: number, name: string): Promise<Channel> => {
    const sql = `
    UPDATE channels 
    SET name = $1 
    WHERE id = $2 
    RETURNING *;
  `;

    const { rows } = await query(sql, [name, id]);
    return rows[0];
};

const deleteChannel = async (id: number): Promise<void> => {
    const sql = `
    UPDATE channels 
    SET deleted_at = NOW() 
    WHERE id = $1;
  `;

    await query(sql, [id]);
};

const getUserRole = async (organizationId: number, userId: number): Promise<string | null> => {
    const sql = `
    SELECT role FROM organization_members 
    WHERE organization_id = $1 AND user_id = $2 AND deleted_at IS NULL;
  `;

    const { rows } = await query(sql, [organizationId, userId]);
    return rows[0]?.role || null;
};

export const channelRepository = {
    createChannel,
    addChannelMember,
    getChannelById,
    isUserInChannel,
    isUserInOrganization,
    updateChannel,
    deleteChannel,
    getUserRole,
};
