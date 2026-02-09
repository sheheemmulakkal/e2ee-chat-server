import { query } from '../../db/db';
import { Message } from '../../types';

const createMessage = async (
    channelId: number,
    senderId: number,
    content: string
): Promise<Message> => {
    const sql = `
    INSERT INTO messages (channel_id, sender_id, content) 
    VALUES ($1, $2, $3) 
    RETURNING *;
  `;

    const { rows } = await query(sql, [channelId, senderId, content]);
    return rows[0];
};

const getMessagesByChannel = async (channelId: number): Promise<any[]> => {
    // JOIN users to get sender details
    const sql = `
    SELECT 
      m.*,
      u.username as sender_username
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.channel_id = $1 AND m.deleted_at IS NULL
    ORDER BY m.created_at ASC;
  `;

    const { rows } = await query(sql, [channelId]);
    return rows;
};

const getMessageById = async (id: number): Promise<Message | null> => {
    const sql = `
    SELECT * FROM messages 
    WHERE id = $1 AND deleted_at IS NULL;
  `;

    const { rows } = await query(sql, [id]);
    return rows[0] || null;
};

const updateMessage = async (id: number, content: string): Promise<Message> => {
    const sql = `
    UPDATE messages 
    SET content = $1, is_edited = TRUE 
    WHERE id = $2 
    RETURNING *;
  `;

    const { rows } = await query(sql, [content, id]);
    return rows[0];
};

const deleteMessage = async (id: number): Promise<void> => {
    const sql = `
    UPDATE messages 
    SET deleted_at = NOW() 
    WHERE id = $1;
  `;

    await query(sql, [id]);
};

export const messageRepository = {
    createMessage,
    getMessagesByChannel,
    getMessageById,
    updateMessage,
    deleteMessage,
};
