export interface Like {
    id: number;
    liker_id: string;
    liked_id: string;
    created_at: string;
  }
  
  export interface LikeCreate {
    liked_id: string;
  }
  
  export interface Visit {
    id: number;
    visitor_id: string;
    visited_id: string;
    created_at: string;
  }
  
  export interface Block {
    id: number;
    blocker_id: string;
    blocked_id: string;
    created_at: string;
  }
  
  export interface BlockCreate {
    blocked_id: string;
  }
  
  export interface Report {
    id: number;
    reporter_id: string;
    reported_id: string;
    reason: string;
    is_resolved: boolean;
    created_at: string;
    resolved_at: string | null;
  }
  
  export interface ReportCreate {
    reported_id: string;
    reason: string;
  }