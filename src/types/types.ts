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
  owner_id: number;
  created_at: Date;
  deleted_at: Date | null;
}

export interface OrganizationMember {
  id: number;
  organization_id: number;
  user_id: number;
  role: 'OWNER' | 'MEMBER';
  joined_at: Date;
  deleted_at: Date | null;
}

export interface Channel {
  id: number;
  organization_id: number;
  name: string;
  type: 'PUBLIC' | 'PRIVATE';
  created_by: number;
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

export interface Invitation {
  id: number;
  sender_id: number;
  receiver_username: string;
  organization_id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface Message {
  id: number;
  channel_id: number;
  sender_id: number;
  content: string;
  is_edited: boolean;
  created_at: Date;
  deleted_at: Date | null;
}
