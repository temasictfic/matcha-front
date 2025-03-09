import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { User } from '@app/core/models/user.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-account-settings',
  standalone: false,
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  @Input() user!: User;
  
  accountForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.accountForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]+$')]],
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    // Initialize form with user data
    if (this.user) {
      this.accountForm.patchValue({
        username: this.user.username,
        email: this.user.email,
        first_name: this.user.first_name,
        last_name: this.user.last_name
      });
    }
  }
  
  // Getter for form controls
  get f() { return this.accountForm.controls; }
  
  async onSubmit(): Promise<void> {
    // Stop here if form is invalid
    if (this.accountForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.success = '';
    
    try {
      // Update user data
      await firstValueFrom(this.authService.updateUserInfo(this.accountForm.value));
      this.success = 'Account information updated successfully.';
    } catch (err: any) {
      this.error = err.message || 'Failed to update account information.';
    } finally {
      this.loading = false;
    }
  }
}