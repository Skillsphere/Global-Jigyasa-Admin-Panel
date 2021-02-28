import { DocumentTranslation } from './document-translation';
import { Observable } from 'rxjs';

export interface Page {
  id?: string;
  title: string;
  description: string;
  key_date: string;
  imageUrl?: File|string|Observable<string>|{ path: string|any, url: string|Observable<string> };
  isActive: boolean;
  totalTime: number;
  blocks?: { [key: string]: QuestionBlock };
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
  author?: string|Observable<string>;
  updatedBy?: string;
}

export interface QuestionBlock {
  key?: string;
  question: string;
  answerType: number;
  imageUrl?: File|string|Observable<string>|{ path: string|any, url: string|Observable<string> };
  answerOptions: AnswerOption[];
}

export interface AnswerOption {
  title: string;
  key: string;
  isAnswer: boolean;
  imageUrl?: File|string|Observable<string>|{ path: string|any, url: string|Observable<string> };
}