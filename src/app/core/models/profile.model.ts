export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    NON_BINARY = 'non_binary',
    OTHER = 'other'
  }
  
  export enum SexualPreference {
    HETEROSEXUAL = 'heterosexual',
    HOMOSEXUAL = 'homosexual',
    BISEXUAL = 'bisexual',
    OTHER = 'other'
  }
  
  export interface Tag {
    id: number;
    name: string;
  }
  
  export interface ProfilePicture {
    id: number;
    profile_id: string;
    file_path: string;
    is_primary: boolean;
    created_at: string;
  }
  
  export interface ProfileBase {
    gender?: Gender | null;
    sexual_preference?: SexualPreference | null;
    biography?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }
  
  export interface Profile extends ProfileBase {
    id: string;
    user_id: string;
    fame_rating: number;
    is_complete: boolean;
    created_at: string;
    updated_at: string;
    pictures: ProfilePicture[];
    tags: Tag[];
  }
  
  export interface ProfileUpdate extends ProfileBase {}
  
  export interface ProfileTagUpdate {
    tags: string[];
  }
  
  export interface LocationUpdate {
    latitude: number;
    longitude: number;
  }
  
  export interface PublicProfile {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    gender?: Gender | null;
    sexual_preference?: SexualPreference | null;
    biography?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    fame_rating: number;
    is_online: boolean;
    last_online: string | null;
    pictures: ProfilePicture[];
    tags: Tag[];
  }