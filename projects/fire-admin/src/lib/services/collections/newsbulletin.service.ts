import { Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { now, guid, isFile } from '../../helpers/functions.helper';
import { StorageService } from '../storage.service';
import { map, take, mergeMap, takeUntil } from 'rxjs/operators';
import { of, merge, Observable } from 'rxjs';
import { getEmptyImage, getLoadingImage } from '../../helpers/assets.helper';
import { SettingsService } from '../settings.service';
import { UsersService } from './users.service';
import { QueryFn } from '@angular/fire/firestore';
import { Newsbulletin, NewsItemStatus } from '../../models/collections/newsbulletin.model';

@Injectable()
export class NewsbulletinsService {

  private allStatus: object = {};
  private statusColors: object = {
    draft: 'warning',
    published: 'success',
    trash: 'danger'
  };
  private imagesCache: object = {};

  constructor(
    protected db: DatabaseService,
    private storage: StorageService,
    private settings: SettingsService,
    private users: UsersService
  ) {
    Object.keys(NewsItemStatus).forEach((key: string) => {
      this.allStatus[NewsItemStatus[key]] = key;
    });
  }

  getAllStatus() {
    return this.allStatus;
  }

  getAllStatusWithColors() {
    return { labels: this.allStatus, colors: this.statusColors };
  }

  getStatus(statusKey: string) {
    return this.allStatus[statusKey];
  }

  add(data: Newsbulletin) {
    const newsbulletin: Newsbulletin = {
      title: data.title,
      addTime: data.addTime,
      imagePath: null,
      description: data.description,
      status: data.status,
      key_date: data.key_date,
      createdAt: now(), // timestamp
      updatedAt: null,
      createdBy: this.db.currentUser.id,
      updatedBy: null
    };

    if (data.imagePath && !isFile(data.imagePath)) {
      newsbulletin.imagePath = data.imagePath;
    }
    
    return new Promise<void>((resolve, reject) => {
      this.db.addDocument('news_items', newsbulletin).then((doc: any) => {
        this.uploadImage(doc.id, data.imagePath as File).then(() => {
          resolve();
        }).catch((error: Error) => {
          reject(error);
        });
      }).catch((error: Error) => {
        reject(error);
      });
    });
  }

  private uploadImage(id: string, imageFile: File) {
    return new Promise<void>((resolve, reject) => {
      if (imageFile && isFile(imageFile)) {
        const imageName = guid() + '.' + imageFile.name.split('.').pop();
        const imagePath = `news/${id}/${imageName}`;
        const downloadURL = this.storage.uploadWithDownloadURL(imagePath, imageFile)
        
        downloadURL.subscribe((imageURL) => {
          this.db.setDocument('news_items', id, { imagePath: imageURL }).then(() => {
            resolve();
          }).catch((error: Error) => {
            reject(error);
          });
        });
      } else {
        resolve();
      }
    });
  }

  get(id: string) {
    return this.db.getDocument('news_items', id).pipe(mergeMap(async (newsbulletin: Newsbulletin) => {
      newsbulletin.id = id;
      return newsbulletin;
    }));
  }

  getImageUrl(imagePath: string) {
    if (this.imagesCache[imagePath]) {
      return of(this.imagesCache[imagePath]);
    } else {
      return this.storage.get(imagePath).getDownloadURL().pipe(map((imageUrl: string) => {
        this.imagesCache[imagePath] = imageUrl;
        return imageUrl;
      }));
    }
  }

  private pipeNewsbulletins(newsbulletinsObservable: Observable<Newsbulletin[]>) {
    return newsbulletinsObservable.pipe(mergeMap(async (newsbulletins: Newsbulletin[]) => {
      //posts.forEach((post: Post) => { // forEach loop doesn't seems to work well with async/await
      for (let newsbulletin of newsbulletins) {
        console.log(newsbulletin);
        // newsbulletin.imagePath = {
        //   path: newsbulletin.imagePath,
        //   url: newsbulletin.imagePath ? merge(of(getLoadingImage()), this.getImageUrl(newsbulletin.imagePath as string)) : of(getEmptyImage())
        // };
        newsbulletin.author = newsbulletin.createdBy ? this.users.getFullName(newsbulletin.createdBy) : of(null);
      }
      return newsbulletins;
    }));
  }

  getAll() {
    return this.pipeNewsbulletins(this.db.getCollection('news_items'));
  }

  getWhere(field: string, operator: firebase.firestore.WhereFilterOp, value: string, applyPipe: boolean = false) {
    return this.getWhereFn(ref => ref.where(field, operator, value), applyPipe);
  }

  getWhereFn(queryFn: QueryFn, applyPipe: boolean = false) {
    const newsbulletinsObservable = this.db.getCollection('news_items', queryFn);
    return applyPipe ? this.pipeNewsbulletins(newsbulletinsObservable) : newsbulletinsObservable;
  }

  edit(id: string, data: Newsbulletin) {
    const newsbulletin: Newsbulletin = {
      title: data.title,
      description: data.description,
      addTime: data.addTime,
      key_date: data.key_date,
      status: data.status,
      updatedAt: now(),
      updatedBy: this.db.currentUser.id
    };
    if (/*data.image !== undefined && */data.imagePath === null) {
      newsbulletin.imagePath = null;
    }
    return new Promise<void>((resolve, reject) => {
      this.db.setDocument('news_items', id, newsbulletin).then(() => {
        this.uploadImage(id, data.imagePath as File).then(() => {
          resolve();
        }).catch((error: Error) => {
          reject(error);
        });
      }).catch((error: Error) => {
        reject(error);
      });
    });
  }

  private deleteImage(imagePath: string) {
    return new Promise<void>((resolve, reject) => {
      // console.log(imagePath);
      if (imagePath) {
        this.storage.delete(imagePath).toPromise().then(() => {
          resolve();
        }).catch((error: Error) => {
          reject(error);
        });
      } else {
        resolve();
      }
    });
  }

  async delete(id: string, data: { imagePath: string }) {
    if (data.imagePath) {
      const newsbulletins: Newsbulletin[] = await this.getWhere('imagePath', '==', data.imagePath).pipe(take(1)).toPromise();
      if (newsbulletins.length > 1) {
        data.imagePath = null; // do not delete image if used by more than 1 post
      }
    }
    return new Promise<void>((resolve, reject) => {
      this.db.deleteDocument('news_items', id).then(() => {
        this.deleteImage(data.imagePath).then(() => {
          resolve();
        }).catch((error: Error) => {
          reject(error);
        });
      }).catch((error: Error) => {
        reject(error);
      });
    });
  }

  setStatus(id: string, status: NewsItemStatus) {
    return this.db.setDocument('news_items', id, { status: status });
  }

  countAll() {
    return this.db.getDocumentsCount('news_items');
  }

  countWhereFn(queryFn: QueryFn) {
    return this.db.getDocumentsCount('news_items', queryFn);
  }

  countWhere(field: string, operator: firebase.firestore.WhereFilterOp, value: string) {
    return this.countWhereFn(ref => ref.where(field, operator, value));
  }

}
