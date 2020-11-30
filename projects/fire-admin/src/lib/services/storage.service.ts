import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class StorageService {

  constructor(private storage: AngularFireStorage) { }

  get(path: string) {
    return this.storage.ref(path);
  }

  upload(path: string, file: File): AngularFireUploadTask {
    return this.get(path).put(file);
  }

  uploadWithDownloadURL(path: string, file: File): Observable<string> {
    const uploadTask: AngularFireUploadTask = this.get(path).put(file);
    return from(uploadTask).pipe(
      switchMap((_) => this.get(path).getDownloadURL()),
    );
  }

  delete(path: string) {
    return this.get(path).delete();
  }
}
