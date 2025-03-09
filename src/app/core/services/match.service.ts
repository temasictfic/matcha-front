import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { 
  Like, 
  LikeCreate, 
  Block, 
  BlockCreate, 
  Report, 
  ReportCreate 
} from '../models/interaction.model';
import { PublicProfile } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = `${environment.apiUrl}/interactions`;
  
  constructor(private http: HttpClient) { }
  
  /**
   * Like a profile
   */
  public likeProfile(profileId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/like`, { liked_id: profileId });
  }
  
  /**
   * Unlike a profile
   */
  public unlikeProfile(profileId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/like/${profileId}`);
  }
  
  /**
   * Block a profile
   */
  public blockProfile(profileId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/block`, { blocked_id: profileId });
  }
  
  /**
   * Unblock a profile
   */
  public unblockProfile(profileId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/block/${profileId}`);
  }
  
  /**
   * Report a profile
   */
  public reportProfile(profileId: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/report`, { 
      reported_id: profileId,
      reason: reason
    });
  }
  
  /**
   * Get profiles that liked current user
   */
  public getLikes(limit: number = 10, offset: number = 0): Observable<PublicProfile[]> {
    return this.http.get<PublicProfile[]>(`${this.apiUrl}/likes`, {
      params: { limit, offset }
    });
  }
  
  /**
   * Get profiles that visited current user
   */
  public getVisits(limit: number = 10, offset: number = 0): Observable<PublicProfile[]> {
    return this.http.get<PublicProfile[]>(`${this.apiUrl}/visits`, {
      params: { limit, offset }
    });
  }
  
  /**
   * Get matches (mutual likes)
   */
  public getMatches(limit: number = 10, offset: number = 0): Observable<PublicProfile[]> {
    return this.http.get<PublicProfile[]>(`${this.apiUrl}/matches`, {
      params: { limit, offset }
    });
  }
}