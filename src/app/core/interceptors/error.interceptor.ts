import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          if (error.status === 401) {
            // Unauthorized, clear token and redirect to login
            this.authService.logout();
            this.router.navigate(['/auth/login'], { 
              queryParams: { returnUrl: this.router.url }
            });
            errorMessage = 'Your session has expired. Please log in again.';
          } else if (error.status === 403) {
            // Forbidden
            errorMessage = 'You do not have permission to access this resource.';
          } else if (error.status === 404) {
            // Not found
            errorMessage = 'The requested resource was not found.';
          } else if (error.status === 400 && error.error?.detail) {
            // Bad request with error details from the API
            errorMessage = error.error.detail;
          } else if (error.error?.detail) {
            // Other errors with details
            errorMessage = error.error.detail;
          } else {
            // Default error message
            errorMessage = `Error Code: ${error.status}. Message: ${error.message}`;
          }
        }
        
        console.error('API Error:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}