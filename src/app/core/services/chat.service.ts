import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Message, ConversationPreview } from '../models/notification.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/realtime`;
  
  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }
  
  /**
   * Get conversations
   */
  public getConversations(limit: number = 10): Observable<ConversationPreview[]> {
    return this.http.get<ConversationPreview[]>(`${this.apiUrl}/conversations`, {
      params: { limit }
    });
  }
  
  /**
   * Get messages between current user and another user
   */
  public getMessages(
    userId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages/${userId}`, {
      params: { limit, offset }
    }).pipe(
      tap(() => {
        // Update unread message count after loading messages
        // (since reading them will mark them as read)
        this.notificationService.loadUnreadMessageCount();
      })
    );
  }
  
  /**
   * Send a message to another user
   */
  public sendMessage(recipientId: string, content: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages`, {
      recipient_id: recipientId,
      content
    });
  }
  
  /**
   * Subscribe to new messages from a specific user
   */
  public listenForNewMessages(senderId: string): Observable<Message> {
    return new Observable<Message>(observer => {
      const subscription = this.notificationService.newMessage$.subscribe(message => {
        if (message.sender_id === senderId) {
          observer.next(message);
        }
      });
      
      return () => {
        subscription.unsubscribe();
      };
    });
  }
  
  /**
   * Format message timestamp for display
   */
  public formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // Within a week - show day name
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      // Older - show date
      return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }
}