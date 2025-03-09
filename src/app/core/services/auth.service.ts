import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { 
  User, 
  UserLogin, 
  UserRegister, 
  TokenResponse, 
  PasswordChange, 
  PasswordReset 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private apiUrl = `${environment.apiUrl}/auth`;
  
  constructor(private http: HttpClient) { }
  
  /**
   * Check if user is authenticated by token
   */
  public checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.getUserInfo().subscribe({
        next: (user) => {
          this.setCurrentUser(user);
        },
        error: () => {
          this.logout();
        }
      });
    } else {
      this.logout();
    }
  }
  
  /**
   * Login user with username and password
   */
  public login(credentials: UserLogin): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login/json`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.access_token);
          this.getUserInfo().subscribe(user => {
            this.setCurrentUser(user);
          });
        })
      );
  }
  
  /**
   * Register a new user
   */
  public register(userData: UserRegister): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
  
  /**
   * Verify email with token
   */
  public verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify`, { params: { token } });
  }
  
  /**
   * Request password reset
   */
  public forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
  
  /**
   * Reset password with token
   */
  public resetPassword(resetData: PasswordReset): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, resetData);
  }
  
  /**
   * Change password
   */
  public changePassword(passwordData: PasswordChange): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, passwordData);
  }
  
  /**
   * Send heartbeat to update online status
   */
  public heartbeat(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/users/heartbeat`, {});
  }
  
  /**
   * Logout user
   */
  public logout(): void {
    // Call logout endpoint to update status
    if (this.isAuthenticatedSubject.value) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: () => {
          console.log('Logged out successfully');
        },
        error: (err) => {
          console.error('Error during logout:', err);
        },
        complete: () => {
          // Clear local storage and user data regardless of API response
          this.clearUserData();
        }
      });
    } else {
      this.clearUserData();
    }
  }
  
  /**
   * Get current user info
   */
  private getUserInfo(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`);
  }
  
  /**
   * Set current user and update authentication state
   */
  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }
  
  /**
   * Clear user data on logout
   */
  private clearUserData(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  public updateUserInfo(formData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/users/me`, formData);
  }
}