export enum NotificationType {
    LIKE = 'like',
    MATCH = 'match',
    VISIT = 'visit',
    MESSAGE = 'message',
    UNMATCH = 'unmatch'
  }
  
  export interface Notification {
    id: number;
    user_id: string;
    sender_id: string | null;
    type: NotificationType;
    content: string | null;
    is_read: boolean;
    created_at: string;
    read_at: string | null;
  }
  
  export interface Message {
    id: number;
    sender_id: string;
    recipient_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    read_at: string | null;
  }
  
  export interface MessageCreate {
    recipient_id: string;
    content: string;
  }
  
  export interface Connection {
    id: number;
    user1_id: string;
    user2_id: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface WebSocketMessage {
    type: string;
    data: any;
  }
  
  export interface ConversationPreview {
    connection: Connection;
    user: any; // This will be the other user
    recent_message: Message | null;
    unread_count: number;
  }