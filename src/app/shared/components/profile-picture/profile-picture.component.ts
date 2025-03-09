import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProfilePicture } from '@app/core/models/profile.model';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-profile-picture',
  standalone: false,
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.scss']
})
export class ProfilePictureComponent {
  @Input() pictures: ProfilePicture[] = [];
  @Input() editable: boolean = false;
  @Input() maxPictures: number = 5;
  
  @Output() uploadPicture = new EventEmitter<File>();
  @Output() deletePicture = new EventEmitter<number>();
  @Output() setPrimaryPicture = new EventEmitter<number>();
  
  selectedFile: File | null = null;
  
  constructor() { }
  
  getPictureUrl(picture: ProfilePicture): string {
    return `${environment.apiUrl}/media/${picture.file_path}`;
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
  
  uploadFile(): void {
    if (this.selectedFile) {
      this.uploadPicture.emit(this.selectedFile);
      this.selectedFile = null;
      
      // Reset file input
      const fileInput = document.getElementById('picture-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  }
  
  onDeletePicture(pictureId: number, event: Event): void {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this picture?')) {
      this.deletePicture.emit(pictureId);
    }
  }
  
  onSetPrimary(pictureId: number, event: Event): void {
    event.stopPropagation();
    this.setPrimaryPicture.emit(pictureId);
  }
}