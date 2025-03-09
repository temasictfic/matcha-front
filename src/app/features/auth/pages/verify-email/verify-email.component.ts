import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: false,
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  token: string | null = null;
  loading = false;
  verifying = false;
  success = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Extract token from URL parameters
    this.token = this.route.snapshot.queryParams['token'];
    
    if (this.token) {
      this.verifying = true;
      this.verifyEmail();
    }
  }

  verifyEmail(): void {
    if (!this.token) {
      this.error = 'Invalid verification token';
      return;
    }

    this.loading = true;

    this.authService.verifyEmail(this.token)
      .subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
        },
        error: err => {
          this.error = err.message || 'Verification failed';
          this.loading = false;
        }
      });
  }

  redirectToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}