import { Observable } from 'rxjs';

export interface Newsbulletin {
  title: string;
  description: string;
  addTime: Date; // timestamp
  imagePath?: File|string|Observable<string>|{ path: string|any, url: string|Observable<string> };
  key_date: string;
  status: NewsItemStatus;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
  author?: string|Observable<string>;
  updatedBy?: string;
}

export enum NewsItemStatus {
  Draft = 'draft',
  Published = 'published',
  Trash = 'trash'
}