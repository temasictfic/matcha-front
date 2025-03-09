import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: false,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  isAuthenticated$: Observable<boolean>;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }
  
  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
  
  navigateToBrowse(): void {
    this.router.navigate(['/browse']);
  }
}