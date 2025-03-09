import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { jwtDecode } from 'jwt-decode'; // You'll need to install this: npm install jwt-decode

interface JwtPayload {
  exp: number;
  sub: string;
  // Add other JWT fields as needed
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private refreshingToken = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  
  constructor(private http: HttpClient) {
    // Check token expiration periodically
    setInterval(() => this.checkTokenExpiration(), 60000); // Check every minute
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }
  
  removeToken(): void {
    localStorage.removeItem('token');
  }
  
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      
      // Check if token will expire in the next 5 minutes
      return decoded.exp < currentTime + 300; // 300 seconds = 5 minutes
    } catch (err) {
      return true;
    }
  }
  
  refreshToken(): Observable<any> {
    if (this.refreshingToken) {
      return this.refreshTokenSubject.asObservable();
    }
    
    this.refreshingToken = true;
    this.refreshTokenSubject.next(null);
    
    return this.http.post<any>(`${environment.apiUrl}/auth/refresh-token`, {})
      .pipe(
        tap((response) => {
          this.setToken(response.access_token);
          this.refreshingToken = false;
          this.refreshTokenSubject.next(response.access_token);
        }),
        catchError(error => {
          this.refreshingToken = false;
          this.removeToken();
          return throwError(() => error);
        })
      );
  }
  
  private checkTokenExpiration(): void {
    if (this.isTokenExpired() && this.getToken()) {
      this.refreshToken().subscribe();
    }
  }
}