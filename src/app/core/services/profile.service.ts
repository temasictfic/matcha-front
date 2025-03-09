import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { 
  Profile, 
  ProfileUpdate, 
  ProfileTagUpdate, 
  LocationUpdate, 
  ProfilePicture,
  PublicProfile 
} from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private userProfileSubject = new BehaviorSubject<Profile | null>(null);
  public userProfile$ = this.userProfileSubject.asObservable();
  
  private apiUrl = `${environment.apiUrl}/profiles`;
  
  constructor(private http: HttpClient) { 
    // Load profile on service initialization
    this.loadUserProfile();
  }
  
  /**
   * Load current user's profile
   */
  public loadUserProfile(): void {
    // Only load if authenticated (token exists)
    if (localStorage.getItem('token')) {
      this.http.get<Profile>(`${this.apiUrl}/me`).subscribe({
        next: (profile) => {
          this.userProfileSubject.next(profile);
        },
        error: (error) => {
          console.error('Error loading profile:', error);
        }
      });
    }
  }
  
  /**
   * Update user profile
   */
  public updateProfile(profileData: ProfileUpdate): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/me`, profileData)
      .pipe(
        tap(profile => {
          this.userProfileSubject.next(profile);
        })
      );
  }
  
  /**
   * Update profile tags
   */
  public updateTags(tags: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/me/tags`, { tags })
      .pipe(
        tap(() => {
          // Reload profile to get updated tags
          this.loadUserProfile();
        })
      );
  }
  
  /**
   * Update user location
   */
  public updateLocation(location: LocationUpdate): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/me/location`, location)
      .pipe(
        tap(profile => {
          this.userProfileSubject.next(profile);
        })
      );
  }
  
  /**
   * Upload profile picture
   */
  public uploadProfilePicture(file: File, isPrimary: boolean = false): Observable<ProfilePicture> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_primary', isPrimary.toString());
    
    return this.http.post<ProfilePicture>(`${this.apiUrl}/me/pictures`, formData)
      .pipe(
        tap(() => {
          // Reload profile to get updated pictures
          this.loadUserProfile();
        })
      );
  }
  
  /**
   * Delete profile picture
   */
  public deleteProfilePicture(pictureId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/me/pictures/${pictureId}`)
      .pipe(
        tap(() => {
          // Reload profile to get updated pictures
          this.loadUserProfile();
        })
      );
  }
  
  /**
   * Set primary profile picture
   */
  public setPrimaryPicture(pictureId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/me/pictures/${pictureId}/primary`, {})
      .pipe(
        tap(() => {
          // Reload profile to get updated pictures
          this.loadUserProfile();
        })
      );
  }
  
  /**
   * Get suggested profiles
   */
  public getSuggestedProfiles(params: any = {}): Observable<PublicProfile[]> {
    return this.http.get<PublicProfile[]>(`${this.apiUrl}/suggested`, { params });
  }
  
  /**
   * Get public profile by ID
   */
  public getProfile(profileId: string): Observable<PublicProfile> {
    return this.http.get<PublicProfile>(`${this.apiUrl}/${profileId}`);
  }
  
  /**
   * Check if profile is complete
   */
  public isProfileComplete(): boolean {
    const profile = this.userProfileSubject.getValue();
    return profile ? profile.is_complete : false;
  }
  
  /**
   * Get primary profile picture URL
   */
  public getPrimaryPictureUrl(): string {
    const profile = this.userProfileSubject.getValue();
    if (profile && profile.pictures && profile.pictures.length > 0) {
      const primaryPicture = profile.pictures.find(pic => pic.is_primary);
      if (primaryPicture) {
        return `${environment.apiUrl}/media/${primaryPicture.file_path}`;
      }
    }
    
    // Return default profile picture if no primary picture found
    return environment.defaultProfilePicture;
  }
}