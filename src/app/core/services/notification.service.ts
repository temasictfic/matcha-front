import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Notification, Message, WebSocketMessage } from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  
  // Notification observables
  private unreadNotificationCountSubject = new BehaviorSubject<number>(0);
  public unreadNotificationCount$ = this.unreadNotificationCountSubject.asObservable();
  
  private unreadMessageCountSubject = new BehaviorSubject<number>(0);
  public unreadMessageCount$ = this.unreadMessageCountSubject.asObservable();
  
  // Message observables for real-time updates
  private newNotificationSubject = new Subject<Notification>();
  public newNotification$ = this.newNotificationSubject.asObservable();
  
  private newMessageSubject = new Subject<Message>();
  public newMessage$ = this.newMessageSubject.asObservable();
  
  private apiUrl = `${environment.apiUrl}/realtime`;
  
  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {
    // Load notification counts when service initializes
    this.loadNotificationCounts();
    
    // Subscribe to auth changes to connect/disconnect WebSocket
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }
  
  /**
   * Connect to WebSocket for real-time updates
   */
  public connect(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token available for WebSocket connection');
      return;
    }
    
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting');
      return;
    }
    
    try {
      const wsUrl = `${environment.wsUrl}/${token}`;
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Start ping interval to keep connection alive
        setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Send ping every 30 seconds
      };
      
      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.handleWebSocketMessage(message);
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      this.socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && event.code !== 1001) {
          this.attemptReconnect();
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }
  
  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      console.log('WebSocket disconnected');
    }
  }
  
  /**
   * Attempt to reconnect to WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Maximum reconnect attempts reached');
    }
  }
  
  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'message':
        this.newMessageSubject.next(message.data);
        // Update unread message count
        this.loadUnreadMessageCount();
        break;
      case 'notification':
        this.newNotificationSubject.next(message.data);
        // Update unread notification count
        this.loadUnreadNotificationCount();
        break;
      case 'pong':
        // Heartbeat response
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }
  
  /**
   * Load notification counts
   */
  private loadNotificationCounts(): void {
    if (localStorage.getItem('token')) {
      this.loadUnreadNotificationCount();
      this.loadUnreadMessageCount();
    }
  }
  
  /**
   * Get notifications
   */
  public getNotifications(
    limit: number = 20, 
    offset: number = 0, 
    unreadOnly: boolean = false
  ): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications`, {
      params: { limit, offset, unread_only: unreadOnly }
    });
  }
  
  /**
   * Get unread notification count
   */
  public loadUnreadNotificationCount(): void {
    this.http.get<{ count: number }>(`${this.apiUrl}/notifications/count`)
      .subscribe({
        next: (response) => {
          this.unreadNotificationCountSubject.next(response.count);
        },
        error: (error) => {
          console.error('Error loading notification count:', error);
        }
      });
  }
  
  /**
   * Mark notification as read
   */
  public markNotificationAsRead(notificationId: number): Observable<Notification> {
    return this.http.post<Notification>(`${this.apiUrl}/notifications/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          // Update unread count
          this.loadUnreadNotificationCount();
        })
      );
  }
  
  /**
   * Mark all notifications as read
   */
  public markAllNotificationsAsRead(): Observable<{ count: number }> {
    return this.http.post<{ count: number }>(`${this.apiUrl}/notifications/read-all`, {})
      .pipe(
        tap(() => {
          // Reset unread count
          this.unreadNotificationCountSubject.next(0);
        })
      );
  }
  
  /**
   * Get unread message count
   */
  public loadUnreadMessageCount(): void {
    this.http.get<{ count: number }>(`${this.apiUrl}/messages/unread/count`)
      .subscribe({
        next: (response) => {
          this.unreadMessageCountSubject.next(response.count);
        },
        error: (error) => {
          console.error('Error loading message count:', error);
        }
      });
  }
}