import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { ProfileService } from '../services/profile.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileCompleteGuard implements CanActivate {
  
  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.profileService.userProfile$.pipe(
      take(1),
      map(profile => {
        if (profile && profile.is_complete) {
          return true;
        } else {
          // Redirect to complete profile
          this.router.navigate(['/profile/edit'], { 
            queryParams: { returnUrl: state.url }
          });
          return false;
        }
      })
    );
  }
}