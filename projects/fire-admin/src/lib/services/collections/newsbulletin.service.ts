import { Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { now, guid, isFile } from '../../helpers/functions.helper';
import { StorageService } from '../storage.service';
import { map, take, mergeMap } from 'rxjs/operators';
import { of, merge, Observable } from 'rxjs';
import { getEmptyImage, getLoadingImage } from '../../helpers/assets.helper';
import { SettingsService } from '../settings.service';
import { Language } from '../../models/language.model';
import { UsersService } from './users.service';
import { QueryFn } from '@angular/fire/firestore';
import { Newsbulletin, NewsItemStatus } from '../../models/collections/newsbulletin.model';

@Injectable()
export class NewsbulletinService {

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
    
    return new Promise((resolve, reject) => {
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
    return new Promise((resolve, reject) => {
      if (imageFile && isFile(imageFile)) {
        const imageName = guid() + '.' + imageFile.name.split('.').pop();
        const imagePath = `news/${id}/${imageName}`;
        this.storage.upload(imagePath, imageFile).then(() => {
          this.db.setDocument('news_items', id, { imagePath: imagePath }).then(() => {
            resolve();
          }).catch((error: Error) => {
            reject(error);
          });
        }).catch((error: Error) => {
          reject(error);
        });
      } else {
        resolve();
      }
    });
  }

  get(id: string) {
    return this.db.getDocument('news_items', id).pipe(mergeMap(async (post: Post) => {
      const translations = await this.getTranslations(post.translationId).pipe(take(1)).toPromise();
      post.id = id;
      post.translations = translations;
      return post;
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

  private pipePosts(postsObservable: Observable<Post[]>) {
    return postsObservable.pipe(mergeMap(async (posts: Post[]) => {
      const activeSupportedLanguages = this.settings.getActiveSupportedLanguages().map((lang: Language) => lang.key);
      //posts.forEach((post: Post) => { // forEach loop doesn't seems to work well with async/await
      for (let post of posts) {
        // console.log(post);
        post.translations = await this.getTranslations(post.translationId).pipe(take(1)).toPromise();
        // console.log(post.translations);
        const postLanguages = Object.keys(post.translations);
        post.image = {
          path: post.image,
          url: post.image ? merge(of(getLoadingImage()), this.getImageUrl(post.image as string)) : of(getEmptyImage())
        };
        post.author = post.createdBy ? this.users.getFullName(post.createdBy) : of(null);
        post.isTranslatable = !activeSupportedLanguages.every((lang: string) => postLanguages.includes(lang));
      }
      //});
      return posts;
    }));
  }

  getAll() {
    return this.pipePosts(this.db.getCollection('posts'));
  }

  getWhere(field: string, operator: firebase.firestore.WhereFilterOp, value: string, applyPipe: boolean = false) {
    return this.getWhereFn(ref => ref.where(field, operator, value), applyPipe);
  }

  getWhereFn(queryFn: QueryFn, applyPipe: boolean = false) {
    const postsObservable = this.db.getCollection('posts', queryFn);
    return applyPipe ? this.pipePosts(postsObservable) : postsObservable;
  }

  edit(id: string, data: Post) {
    const post: Post = {
      title: data.title,
      lang: data.lang,
      slug: data.slug,
      date: data.date,
      content: data.content,
      status: data.status,
      categories: data.categories,
      updatedAt: now(),
      updatedBy: this.db.currentUser.id
    };
    if (/*data.image !== undefined && */data.image === null) {
      post.image = null;
    }
    return new Promise((resolve, reject) => {
      this.db.setDocument('posts', id, post).then(() => {
        this.uploadImage(id, data.image as File).then(() => {
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
    return new Promise((resolve, reject) => {
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

  async delete(id: string, data: { imagePath: string, lang: string, translationId: string, translations: PostTranslation }) {
    if (data.imagePath) {
      const posts: Post[] = await this.getWhere('image', '==', data.imagePath).pipe(take(1)).toPromise();
      if (posts.length > 1) {
        data.imagePath = null; // do not delete image if used by more than 1 post
      }
    }
    return new Promise((resolve, reject) => {
      this.deleteTranslation(data.translationId, data.lang, data.translations).then(() => { // should be done before deleting document (posts observable will be synced before if not)
        this.db.deleteDocument('posts', id).then(() => {
          this.deleteImage(data.imagePath).then(() => {
            resolve();
          }).catch((error: Error) => {
            reject(error);
          });
        }).catch((error: Error) => {
          reject(error);
        });
      }).catch((error: Error) => {
        reject(error);
      });
    });
  }

  setStatus(id: string, status: NewsItemStatus) {
    return this.db.setDocument('posts', id, { status: status });
  }

  isSlugDuplicated(slug: string, lang: string, id?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.getWhereFn(ref => ref.where('slug', '==', slug).where('lang', '==', lang)).pipe(take(1)).toPromise().then((posts: Post[]) => {
        //console.log(posts, posts[0]['id']);
        resolve(posts && posts.length && (!id || (posts[0]['id'] as any) !== id));
      }).catch((error: Error) => {
        reject(error);
      });
    });
  }

  countAll() {
    return this.db.getDocumentsCount('posts');
  }

  countWhereFn(queryFn: QueryFn) {
    return this.db.getDocumentsCount('posts', queryFn);
  }

  countWhere(field: string, operator: firebase.firestore.WhereFilterOp, value: string) {
    return this.countWhereFn(ref => ref.where(field, operator, value));
  }

}
