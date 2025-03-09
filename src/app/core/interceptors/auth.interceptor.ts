import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Router } from '@angular/router';
import { TokenService } from '../services/token-refresh.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get token from localStorage
    const token = this.tokenService.getToken();
    
    // Only intercept requests to our API
    if (request.url.startsWith(environment.apiUrl)) {
      // Add auth header if token exists
      if (token) {
        request = this.addToken(request, token);
      }
    }
    
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Try to refresh token only if not already refreshing
          // and if we're not making a login or refresh token request
          if (!this.isRefreshing && !request.url.includes('/auth/login') && !request.url.includes('/auth/refresh-token')) {
            return this.handle401Error(request, next);
          } else if (this.isRefreshing) {
            // Wait for token to be refreshed
            return this.refreshTokenSubject.pipe(
              filter(token => token != null),
              take(1),
              switchMap(jwt => {
                return next.handle(this.addToken(request, jwt));
              })
            );
          } else {
            // For login/refresh requests or when refresh fails, redirect to login
            this.tokenService.removeToken();
            this.router.navigate(['/auth/login'], { 
              queryParams: { returnUrl: this.router.url, message: 'Your session has expired. Please log in again.' }
            });
          }
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.tokenService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.access_token);
          return next.handle(this.addToken(request, token.access_token));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.tokenService.removeToken();
          this.router.navigate(['/auth/login'], { 
            queryParams: { returnUrl: this.router.url, message: 'Your session has expired. Please log in again.' }
          });
          return throwError(() => err);
        })
      );
    }
    
    return this.refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(jwt => {
        return next.handle(this.addToken(request, jwt));
      })
    );
  }
}