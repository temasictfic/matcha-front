import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '@app/core/services/profile.service';
import { Profile, ProfilePicture } from '@app/core/models/profile.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile-pictures',
  standalone: false,
  templateUrl: './profile-pictures.component.html',
  styleUrls: ['./profile-pictures.component.scss']
})
export class ProfilePicturesComponent implements OnInit {
  profile: Profile | null = null;
  loading = true;
  uploading = false;
  error = '';
  success = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.profile = await firstValueFrom(this.profileService.userProfile$);
    } catch (err) {
      this.error = 'Failed to load profile data';
      console.error('Error loading profile:', err);
    } finally {
      this.loading = false;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file size
      if (file.size > this.maxFileSize) {
        this.error = `File size exceeds the maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`;
        this.selectedFile = null;
        this.imagePreview = null;
        input.value = '';
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        this.error = 'Invalid file type. Please upload a JPEG, PNG, or GIF image.';
        this.selectedFile = null;
        this.imagePreview = null;
        input.value = '';
        return;
      }
      
      this.selectedFile = file;
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadPicture(isPrimary: boolean = false): Promise<void> {
    if (!this.selectedFile) {
      return;
    }

    this.uploading = true;
    this.error = '';
    this.success = '';

    try {
      await firstValueFrom(this.profileService.uploadProfilePicture(this.selectedFile, isPrimary));
      
      // Reload profile to get updated pictures
      this.profile = await firstValueFrom(this.profileService.userProfile$);
      
      // Reset file selection
      this.selectedFile = null;
      this.imagePreview = null;
      
      // Reset file input
      const fileInput = document.getElementById('picture-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      this.success = 'Picture uploaded successfully';
    } catch (err: any) {
      this.error = err.message || 'Failed to upload picture';
    } finally {
      this.uploading = false;
    }
  }

  async deletePicture(pictureId: number): Promise<void> {
    if (!confirm('Are you sure you want to delete this picture?')) {
      return;
    }

    this.error = '';
    this.success = '';

    try {
      await firstValueFrom(this.profileService.deleteProfilePicture(pictureId));
      
      // Reload profile to get updated pictures
      this.profile = await firstValueFrom(this.profileService.userProfile$);
      
      this.success = 'Picture deleted successfully';
    } catch (err: any) {
      this.error = err.message || 'Failed to delete picture';
    }
  }

  async setPrimaryPicture(pictureId: number): Promise<void> {
    this.error = '';
    this.success = '';

    try {
      await firstValueFrom(this.profileService.setPrimaryPicture(pictureId));
      
      // Reload profile to get updated pictures
      this.profile = await firstValueFrom(this.profileService.userProfile$);
      
      this.success = 'Primary picture updated successfully';
    } catch (err: any) {
      this.error = err.message || 'Failed to update primary picture';
    }
  }

  getPictureUrl(picture: ProfilePicture): string {
    // Assuming the API returns a relative path
    return `${picture.file_path}`;
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}