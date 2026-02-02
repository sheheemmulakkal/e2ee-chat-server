export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
  deleted_at: Date | null;
}

export interface Organization {
  id: number;
  name: string;
  created_at: Date;
  deleted_at: Date | null;
}

export interface OrganizationMember {
  id: number;
  organization_id: number;
  user_id: number;
  role: 'admin' | 'member';
  joined_at: Date;
  deleted_at: Date | null;
}

export interface Channel {
  id: number;
  organization_id: number;
  name: string;
  created_at: Date;
  deleted_at: Date | null;
}

export interface ChannelMember {
  id: number;
  channel_id: number;
  user_id: number;
  joined_at: Date;
  deleted_at: Date | null;
}

export interface Message {
  id: number;
  channel_id: number;
  member_id: number | null;
  content: string;
  created_at: Date;
  deleted_at: Date | null;
}
