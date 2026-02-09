import pool, { query } from '../../db/db';
import { Organization, OrganizationMember } from '../../types';

const createOrganizationWithChannels = async (
    name: string,
    ownerId: number
): Promise<Organization> => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Create organization
        const orgSql = `
      INSERT INTO organizations (name, owner_id) 
      VALUES ($1, $2) 
      RETURNING *;
    `;
        const { rows: orgRows } = await client.query(orgSql, [name, ownerId]);
        const organization = orgRows[0];

        // 2. Add creator as OWNER in organization_members
        const memberSql = `
      INSERT INTO organization_members (organization_id, user_id, role) 
      VALUES ($1, $2, $3);
    `;
        await client.query(memberSql, [organization.id, ownerId, 'OWNER']);

        // 3. Create 3 default channels
        const channelSql = `
      INSERT INTO channels (organization_id, name, type, created_by) 
      VALUES ($1, $2, $3, $4);
    `;
        await client.query(channelSql, [organization.id, 'General', 'PUBLIC', ownerId]);
        await client.query(channelSql, [organization.id, 'Random', 'PUBLIC', ownerId]);
        await client.query(channelSql, [organization.id, 'Announcements', 'PUBLIC', ownerId]);

        await client.query('COMMIT');
        return organization;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const addMember = async (
    organizationId: number,
    userId: number,
    role: 'OWNER' | 'MEMBER'
): Promise<OrganizationMember> => {
    const sql = `
    INSERT INTO organization_members (organization_id, user_id, role) 
    VALUES ($1, $2, $3) 
    RETURNING *;
  `;

    const { rows } = await query(sql, [organizationId, userId, role]);
    return rows[0];
};

const getMemberRole = async (
    organizationId: number,
    userId: number
): Promise<OrganizationMember | null> => {
    const sql = `
    SELECT * FROM organization_members 
    WHERE organization_id = $1 AND user_id = $2 AND deleted_at IS NULL;
  `;

    const { rows } = await query(sql, [organizationId, userId]);
    return rows[0] || null;
};

const getOwnerCount = async (organizationId: number): Promise<number> => {
    const sql = `
    SELECT COUNT(*) as count FROM organization_members 
    WHERE organization_id = $1 AND role = $2 AND deleted_at IS NULL;
  `;

    const { rows } = await query(sql, [organizationId, 'OWNER']);
    return parseInt(rows[0].count);
};

const removeMember = async (organizationId: number, userId: number): Promise<void> => {
    const sql = `
    UPDATE organization_members 
    SET deleted_at = NOW() 
    WHERE organization_id = $1 AND user_id = $2;
  `;

    await query(sql, [organizationId, userId]);
};

const getOrganizationById = async (id: number): Promise<Organization | null> => {
    const sql = `
    SELECT * FROM organizations 
    WHERE id = $1 AND deleted_at IS NULL;
  `;

    const { rows } = await query(sql, [id]);
    return rows[0] || null;
};

export const organizationRepository = {
    createOrganizationWithChannels,
    addMember,
    getMemberRole,
    getOwnerCount,
    removeMember,
    getOrganizationById,
};
