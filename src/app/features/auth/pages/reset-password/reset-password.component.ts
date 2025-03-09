import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '@app/core/services/auth.service';
import { passwordMatchValidator } from '../../validators/password-match.validator';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isSubmitting = false;
  token: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.token = this.route.snapshot.queryParams['token'] || '';
    
    if (!this.token) {
      /* this.notificationService.error('Invalid or missing reset token'); */
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  initForm(): void {
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token) {
      return;
    }

    this.isSubmitting = true;
    const password = this.resetPasswordForm.get('password')?.value;

    const resetData = {
      token: this.token,
      new_password: password
    };

    this.authService.resetPassword(resetData).subscribe({
      next: () => {
        /* TODO: this.notificationService.success('Password has been reset successfully'); */
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isSubmitting = false;
        /* TODO: this.notificationService.error(error.message || 'Failed to reset password'); */
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}