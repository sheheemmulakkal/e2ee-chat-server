// src/setup.ts
import db from '../db/db'; // Your existing db connection

async function setupDatabase() {
    try {
        await db.query('BEGIN'); // Use transaction to ensure all create or none

        // 1. Users Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL
            );
        `);

        // 2. Organizations Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS organizations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL
            );
        `);

        // 3. Organization Members
        await db.query(`
            CREATE TABLE IF NOT EXISTS organization_members (
                id SERIAL PRIMARY KEY,
                organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'member')),
                joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL, 
                UNIQUE (organization_id, user_id)
            );
        `);

        // 4. Channels
        await db.query(`
            CREATE TABLE IF NOT EXISTS channels (
                id SERIAL PRIMARY KEY,
                organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL,
                UNIQUE (organization_id, name)
            );
        `);

        // 5. Channel Members
        await db.query(`
            CREATE TABLE IF NOT EXISTS channel_members (
                id SERIAL PRIMARY KEY,
                channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL,
                UNIQUE (channel_id, user_id)
            );
        `);

        // 6. Messages
        await db.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
                member_id INTEGER REFERENCES channel_members(id) ON DELETE SET NULL, 
                content TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL
            );
        `);

        // Indexes for performance on Joins
        await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);`);

        await db.query('COMMIT');
        console.log('Database setup complete with Soft Deletes and References.');

    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Database setup failed:', err);
        process.exit(1);
    }
}

setupDatabase();