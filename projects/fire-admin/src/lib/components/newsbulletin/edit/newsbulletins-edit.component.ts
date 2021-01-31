import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { initTextEditor } from '../../../helpers/posts.helper';
import { I18nService } from '../../../services/i18n.service';
import { Category } from '../../../models/collections/category.model';
import { Observable, Subscription, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { AlertService } from '../../../services/alert.service';
import { NavigationService } from '../../../services/navigation.service';
import { getEmptyImage } from '../../../helpers/assets.helper';
import { ActivatedRoute } from '@angular/router';
import { Newsbulletin, NewsItemStatus } from '../../../models/collections/newsbulletin.model';
import { NewsbulletinsService } from '../../../services/collections/newsbulletin.service';

@Component({
  selector: 'fa-posts-edit',
  templateUrl: './newsbulletins-edit.component.html',
  styleUrls: ['./newsbulletins-edit.component.css']
})
export class NewsbulletinsEditComponent implements OnInit, AfterViewInit, OnDestroy {

  private id: string;
  title: string;
  addTime: Date;
  key_date: string;
  editor: any;
  private status: NewsItemStatus;
  private image: File;
  imageSrc: string|ArrayBuffer;
  isSubmitButtonsDisabled: boolean = false;
  isImageEmpty: boolean = true;
  
  allStatus: object|any = {};
  private subscription: Subscription = new Subscription();
  private routeParamsChange: Subject<void> = new Subject<void>();

  constructor(
    private i18n: I18nService,
    private alert: AlertService,
    private newsbulletins: NewsbulletinsService,
    public navigation: NavigationService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.allStatus = this.newsbulletins.getAllStatus();
    this.isSubmitButtonsDisabled = true;
    this.subscription.add(
      this.route.params.subscribe((params: { id: string }) => {
        // console.log(params);
        this.newsbulletins.get(params.id).pipe(take(1)).toPromise().then((newsbulletin: Newsbulletin) => {
          console.log(newsbulletin);
          if (newsbulletin) {
            this.id = newsbulletin.id;
            this.title = newsbulletin.title;
            this.editor.root.innerHTML = newsbulletin.description;
            this.status = newsbulletin.status;
            this.key_date = new Date(newsbulletin.key_date).toISOString().slice(0, 10);
            this.image = null;
            this.imageSrc = getEmptyImage();
            if (newsbulletin.imagePath) {
              this.imageSrc = (newsbulletin.imagePath as  string);
            }
            this.routeParamsChange.next();
            this.setCategoriesObservable();
            this.isSubmitButtonsDisabled = false;
          } else {
            this.navigation.redirectTo('newsbulletins', 'list');
          }
        });
      })
    );
  }

  ngAfterViewInit() {
    this.editor = initTextEditor('#editor-container', 'News Bulletin Content');
    this.editor.on('text-change', () => {
      this.isSubmitButtonsDisabled = !(this.editor.getLength() > 1);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.routeParamsChange.next();
  }

  private setCategoriesObservable() {
    
  }

  onTitleInput() {
    
  }

  addCategory(event: Event) {
    
  }

  getDescription() {
    var description = "";
    
    var data = this.editor.getContents();
    Object.keys(data.ops).map(item => {
      description += data.ops[item].insert;
    });

    return description;
  }

  onCategoryCheck(category: Category, event: Event|any) {
    
  }

  onImageChange(event: Event) {
    this.image = (event.target as HTMLInputElement).files[0];
    this.isImageEmpty = (this.image == null);
    const reader = new FileReader();
    reader.onload = () => {
      this.imageSrc = reader.result;
    };
    reader.readAsDataURL(this.image);
  }

  savePost(event: Event) {
    const target = event.target as any;
    const startLoading = () => {
      target.isLoading = true;
      this.isSubmitButtonsDisabled = true;
    };
    const stopLoading = () => {
      target.isLoading = false;
      this.isSubmitButtonsDisabled = false;
    };
    startLoading();
    
    // Edit post
    const data: Newsbulletin = {
      title: this.title,
      description: this.getDescription(),
      addTime: new Date(this.key_date),
      key_date: this.key_date,
      imagePath: this.image,
      status: this.status
    };
    
    this.newsbulletins.edit(this.id, data).then(() => {
      this.alert.success(this.i18n.get('News Bulletin Saved'), false, 5000, true);
      this.navigation.redirectTo('newsbulletins', 'list');
    }).catch((error: Error) => {
      this.alert.error(error.message);
    }).finally(() => {
      stopLoading();
    });

  }

}
