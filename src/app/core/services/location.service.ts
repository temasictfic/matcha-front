import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LocationUpdate } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  
  constructor() { }
  
  /**
   * Get current user location
   */
  public getCurrentLocation(): Observable<LocationUpdate> {
    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      return throwError(() => new Error('Geolocation is not supported by your browser'));
    }
    
    // Create an observable from the geolocation API
    return from(
      new Promise<LocationUpdate>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      })
    ).pipe(
      catchError(error => {
        let errorMessage = 'Unknown error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out';
            break;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  /**
   * Calculate distance between two points in kilometers
   */
  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }
  
  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  /**
   * Format distance for display
   */
  public formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    } else {
      return `${Math.round(distance * 10) / 10} km`;
    }
  }
}