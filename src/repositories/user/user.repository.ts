import bcrypt from 'bcrypt';
import { query } from '../../db/db';
import { User } from '../../types';

const createUser = async (username: string, plainPassword: string): Promise<User> => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  
  const sql = `
    INSERT INTO users (username, password_hash) 
    VALUES ($1, $2) 
    RETURNING *;
  `;
  
  const { rows } = await query(sql, [username, hash]);
  return rows[0];
};

const getUserByUsername = async (username: string): Promise<User | null> => {
  const sql = `
    SELECT * FROM users 
    WHERE username = $1 AND deleted_at IS NULL;
  `;
  
  const { rows } = await query(sql, [username]);
  return rows[0] || null;
};

const getUserById = async (id: number): Promise<User | null> => {
  const sql = `
    SELECT * FROM users 
    WHERE id = $1 AND deleted_at IS NULL;
  `;
  
  const { rows } = await query(sql, [id]);
  return rows[0] || null;
}

export const userRepository = {
  createUser,
  getUserByUsername,
  getUserById,
};