import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfileService } from '@app/core/services/profile.service';
import { LocationService } from '@app/core/services/location.service';
import { Gender, SexualPreference, Profile, LocationUpdate } from '@app/core/models/profile.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile-edit',
  standalone: false,
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  profileForm: FormGroup;
  tagForm: FormGroup;
  profile: Profile | null = null;
  loading = true;
  saving = false;
  savingTags = false;
  error = '';
  success = '';
  locationError = '';
  returnUrl = '';

  // Enum values for select options
  genderOptions = Object.values(Gender);
  sexualPreferenceOptions = Object.values(SexualPreference);

  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private locationService: LocationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize forms
    this.profileForm = this.formBuilder.group({
      gender: [null, Validators.required],
      sexual_preference: [null, Validators.required],
      biography: ['', [Validators.required, Validators.maxLength(500)]],
      latitude: [null],
      longitude: [null]
    });

    this.tagForm = this.formBuilder.group({
      tagString: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    // Get return URL from route parameters or default to profile
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/profile';

    try {
      // Load profile data
      this.profile = await firstValueFrom(this.profileService.userProfile$);
      
      if (this.profile) {
        // Populate form with existing data
        this.profileForm.patchValue({
          gender: this.profile.gender,
          sexual_preference: this.profile.sexual_preference,
          biography: this.profile.biography,
          latitude: this.profile.latitude,
          longitude: this.profile.longitude
        });
      }
    } catch (err) {
      this.error = 'Failed to load profile data';
      console.error('Error loading profile:', err);
    } finally {
      this.loading = false;
    }
  }

  // Getter for form controls
  get f() { return this.profileForm.controls; }

  async onSubmit(): Promise<void> {
    // Stop here if form is invalid
    if (this.profileForm.invalid) {
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    try {
      await firstValueFrom(this.profileService.updateProfile(this.profileForm.value));
      this.success = 'Profile updated successfully';
      
      // If there's a return URL, navigate to it after a short delay
      if (this.returnUrl !== '/profile') {
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 1500);
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to update profile';
    } finally {
      this.saving = false;
    }
  }

  async detectLocation(): Promise<void> {
    this.locationError = '';
    
    try {
      const location = await firstValueFrom(this.locationService.getCurrentLocation());
      
      this.profileForm.patchValue({
        latitude: location.latitude,
        longitude: location.longitude
      });
    } catch (err: any) {
      this.locationError = err.message || 'Failed to detect location';
    }
  }

  onLocationChanged(location: LocationUpdate): void {
    this.profileForm.patchValue({
      latitude: location.latitude,
      longitude: location.longitude
    });
  }

  async addTag(): Promise<void> {
    const tagString = this.tagForm.get('tagString')?.value?.trim();
    
    if (!tagString || (this.profile?.tags && this.profile.tags.length >= 10)) {
      return;
    }

    this.savingTags = true;
    
    try {
      const tags = tagString.split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
      
      // Get existing tag names
      const existingTags = this.profile?.tags?.map(t => t.name) || [];
      
      // Combine existing and new tags, remove duplicates
      const allTags = [...new Set([...existingTags, ...tags])];
      
      // Update tags on server
      await firstValueFrom(this.profileService.updateTags(allTags));
      
      // Reload profile to get updated tags
      this.profile = await firstValueFrom(this.profileService.userProfile$);
      
      // Clear tag input
      this.tagForm.get('tagString')?.setValue('');
    } catch (err: any) {
      this.error = err.message || 'Failed to add tag';
    } finally {
      this.savingTags = false;
    }
  }

  async addNewTag(tagName: string): Promise<void> {
    if (!tagName || (this.profile?.tags && this.profile.tags.length >= 10)) {
      return;
    }
  
    this.savingTags = true;
    
    try {
      // Get existing tag names
      const existingTags = this.profile?.tags?.map(t => t.name) || [];
      
      // Add the new tag if it doesn't exist
      if (!existingTags.includes(tagName)) {
        // Update tags on server
        await firstValueFrom(this.profileService.updateTags([...existingTags, tagName]));
        
        // Reload profile to get updated tags
        this.profile = await firstValueFrom(this.profileService.userProfile$);
      }
    } catch (err: any) {
      this.error = err.message || 'Failed to add tag';
    } finally {
      this.savingTags = false;
    }
  }

  async removeTag(tagId: number): Promise<void> {
    if (!this.profile?.tags) return;
    
    this.savingTags = true;
    
    try {
      // Get all tags except the one to remove
      const tagsToKeep = this.profile.tags
        .filter(tag => tag.id !== tagId)
        .map(tag => tag.name);
      
      // Update tags on server
      await firstValueFrom(this.profileService.updateTags(tagsToKeep));
      
      // Reload profile to get updated tags
      this.profile = await firstValueFrom(this.profileService.userProfile$);
    } catch (err: any) {
      this.error = err.message || 'Failed to remove tag';
    } finally {
      this.savingTags = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}