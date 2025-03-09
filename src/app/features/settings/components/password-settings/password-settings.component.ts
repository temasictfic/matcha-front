import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-password-settings',
  standalone: false,
  templateUrl: './password-settings.component.html',
  styleUrls: ['./password-settings.component.scss']
})
export class PasswordSettingsComponent {
  passwordForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.passwordForm = this.formBuilder.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }
  
  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('new_password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
  
  // Getter for form controls
  get f() { return this.passwordForm.controls; }
  
  async onSubmit(): Promise<void> {
    // Stop here if form is invalid
    if (this.passwordForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.success = '';
    
    try {
      // Change password
      await firstValueFrom(this.authService.changePassword({
        current_password: this.passwordForm.value.current_password,
        new_password: this.passwordForm.value.new_password
      }));
      
      this.success = 'Password changed successfully.';
      this.passwordForm.reset();
    } catch (err: any) {
      this.error = err.message || 'Failed to change password.';
    } finally {
      this.loading = false;
    }
  }
}