import { Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { UsersService } from './users.service';
import { now } from '../../helpers/functions.helper';
import { mergeMap, take } from 'rxjs/operators';
import { SettingsService } from '../settings.service';
import { Observable, of } from 'rxjs';
import { QueryFn } from '@angular/fire/firestore';
import { Quiz, QuestionBlock } from '../../models/collections/quiz.model';

@Injectable()
export class DailyQuizService {

  constructor(
    protected db: DatabaseService,
    private settings: SettingsService,
    private users: UsersService
  ) {

  }

  // formatBlocks(blocks: QuestionBlock[]) {
  //   let formattedBlocks = {};
  //   blocks.forEach((block: QuestionBlock, index: number) => {
  //     let key = block.key || index;
  //     if (formattedBlocks[key]) {
  //       key += '-' + index;
  //     }
  //     formattedBlocks[key] = {
  //       name: block.name,
  //       type: block.type,
  //       content: block.content
  //     };
  //   });
  //   //console.log(blocks, formattedBlocks);
  //   return formattedBlocks;
  // }

  add(data: Quiz) {
    const quiz: Quiz = {
      title: data.title,
      description: data.description,
      key_date: data.key_date,
      imageUrl: data.imageUrl,
      totalTime: data.totalTime,
      isActive: true,
      createdAt: now(), // timestamp
      updatedAt: null,
      createdBy: this.db.currentUser.id,
      updatedBy: null
    };

    return new Promise<void>((resolve, reject) => {
      this.db.addDocument('quizes', quiz).then((doc: any) => {
        // for (let question in data.blocks) {
        //   this.db.addDocument(`quizes/${doc.id}/quiz_questions`, question).then((ques: any) => {
        //     resolve();
        //   }).catch((error: Error) => {
        //     reject(error);
        //   })
        // }
        this.db.addDocument(`quizes/${doc.id}/quiz_questions`, quiz).then((ques: any) => {
          resolve();
        }).catch((error: Error) => {
          reject(error);
        })
      }).catch((error: Error) => {
        reject(error);
      });
    });
  }

  get(id: string) {
    return this.db.getDocument('quizes', id).pipe(mergeMap(async (quiz: Quiz) => {
      quiz.id = id;
      return quiz;
    }));
  }

  // private pipePages(pagesObservable: Observable<Page[]>) {
  //   return pagesObservable.pipe(mergeMap(async (pages: Page[]) => {
  //     const activeSupportedLanguages = this.settings.getActiveSupportedLanguages().map((lang: Language) => lang.key);
  //     //pages.forEach((page: Page) => { // forEach loop doesn't seems to work well with async/await
  //     for (let page of pages) {
  //       // console.log(page);
  //       page.translations = page.translationId ? await this.getTranslations(page.translationId).pipe(take(1)).toPromise() : {};
  //       // console.log(page.translations);
  //       const pageLanguages = Object.keys(page.translations);
  //       page.author = page.createdBy ? this.users.getFullName(page.createdBy) : of(null);
  //       page.isTranslatable = !activeSupportedLanguages.every((lang: string) => pageLanguages.includes(lang));
  //     }
  //     //});
  //     return pages;
  //   }));
  // }

  // getAll() {
  //   return null;//this.pipePages(this.db.getCollection('quizes'));
  // }

  // getWhere(field: string, operator: firebase.firestore.WhereFilterOp, value: string, applyPipe: boolean = false) {
  //   return this.getWhereFn(ref => ref.where(field, operator, value), applyPipe);
  // }

  // getWhereFn(queryFn: QueryFn, applyPipe: boolean = false) {
  //   const pagesObservable = this.db.getCollection('quizes', queryFn);
  //   return null;//applyPipe ? this.pipePages(pagesObservable) : pagesObservable;
  // }

  // edit(id: string, data: Page) {
  //   const page: Page = {
  //     title: data.title,
  //     lang: data.lang,
  //     slug: data.slug,
  //     //blocks: data.blocks || {}, // blocks should be replaced instead of been merged
  //     updatedAt: now(),
  //     updatedBy: this.db.currentUser.id
  //   };
  //   return new Promise((resolve, reject) => {
  //     this.db.setDocument('quizes', id, page).then(() => {
  //       // replace blocks
  //       this.db.updateDocument('quizes', id, { blocks: data.blocks || {} }).then(() => {
  //         resolve();
  //       }).catch((error: Error) => {
  //         reject(error);
  //       });
  //     }).catch((error: Error) => {
  //       reject(error);
  //     });
  //   });
  // }

  // delete(id: string, data: { lang: string, translationId: string, translations: PageTranslation }) {
  //   return new Promise((resolve, reject) => {
  //     this.deleteTranslation(data.translationId, data.lang, data.translations).then(() => { // should be done before deleting document (pages observable will be synced before if not)
  //       this.db.deleteDocument('quizes', id).then(() => {
  //         resolve();
  //       }).catch((error: Error) => {
  //         reject(error);
  //       });
  //     }).catch((error: Error) => {
  //       reject(error);
  //     });
  //   });
  // }

  // isSlugDuplicated(slug: string, lang: string, id?: string): Promise<boolean> {
  //   return new Promise((resolve, reject) => {
  //     this.getWhereFn(ref => ref.where('slug', '==', slug).where('lang', '==', lang)).pipe(take(1)).toPromise().then((pages: Page[]) => {
  //       //console.log(pages, pages[0]['id']);
  //       resolve(pages && pages.length && (!id || (pages[0]['id'] as any) !== id));
  //     }).catch((error: Error) => {
  //       reject(error);
  //     });
  //   });
  // }

  countAll() {
    return this.db.getDocumentsCount('quizes');
  }

  countWhereFn(queryFn: QueryFn) {
    return this.db.getDocumentsCount('quizes', queryFn);
  }

  countWhere(field: string, operator: firebase.firestore.WhereFilterOp, value: string) {
    return this.countWhereFn(ref => ref.where(field, operator, value));
  }

}
