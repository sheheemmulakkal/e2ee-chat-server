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

        // 2. Organizations Table (with owner_id)
        await db.query(`
            CREATE TABLE IF NOT EXISTS organizations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL
            );
        `);

        // 3. Organization Members (role: OWNER, MEMBER)
        await db.query(`
            CREATE TABLE IF NOT EXISTS organization_members (
                id SERIAL PRIMARY KEY,
                organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                role VARCHAR(10) NOT NULL CHECK (role IN ('OWNER', 'MEMBER')),
                joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL, 
                UNIQUE (organization_id, user_id)
            );
        `);

        // 4. Channels (with type and created_by)
        await db.query(`
            CREATE TABLE IF NOT EXISTS channels (
                id SERIAL PRIMARY KEY,
                organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(10) NOT NULL CHECK (type IN ('PUBLIC', 'PRIVATE')),
                created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL,
                UNIQUE (organization_id, name)
            );
        `);

        // 5. Channel Members (for PRIVATE channel access)
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

        // 6. Invitations (new table)
        await db.query(`
            CREATE TABLE IF NOT EXISTS invitations (
                id SERIAL PRIMARY KEY,
                sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                receiver_username VARCHAR(255) NOT NULL,
                organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
                status VARCHAR(10) NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL
            );
        `);

        // 7. Messages (sender_id instead of member_id, with is_edited)
        await db.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
                sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                is_edited BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ DEFAULT NULL
            );
        `);

        // Indexes for performance on Joins
        await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON channel_members(channel_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_channel_members_user ON channel_members(user_id);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_invitations_receiver ON invitations(receiver_username);`);
        await db.query(`CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);`);

        await db.query('COMMIT');
        console.log('Database setup complete with Soft Deletes and References.');

    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Database setup failed:', err);
        process.exit(1);
    }
}

setupDatabase();