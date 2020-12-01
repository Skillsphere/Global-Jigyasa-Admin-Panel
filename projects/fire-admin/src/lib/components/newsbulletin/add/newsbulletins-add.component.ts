import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { initTextEditor } from '../../../helpers/posts.helper';
import { I18nService } from '../../../services/i18n.service';
import { SettingsService } from '../../../services/settings.service';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AlertService } from '../../../services/alert.service';
import { NavigationService } from '../../../services/navigation.service';
import { getEmptyImage } from '../../../helpers/assets.helper';
import { NewsItemStatus } from '../../../models/collections/newsbulletin.model';
import { NewsbulletinsService } from '../../../services/collections/newsbulletin.service';

@Component({
  selector: 'fa-posts-add',
  templateUrl: './newsbulletins-add.component.html',
  styleUrls: ['./newsbulletins-add.component.css']
})
export class NewsbulletinsAddComponent implements OnInit, AfterViewInit, OnDestroy {
  title: string;
  addTime: Date;
  key_date: string;
  editor: any;
  private status: NewsItemStatus;
  private image: File;
  imageSrc: string|ArrayBuffer;
  isSubmitButtonsDisabled: boolean = false;

  constructor(
    private i18n: I18nService,
    private settings: SettingsService,
    private alert: AlertService,
    private newsbulletins: NewsbulletinsService,
    private navigation: NavigationService
  ) { }

  ngOnInit() {
    this.status = NewsItemStatus.Draft;
    this.key_date = new Date().toISOString().slice(0, 10);
    this.image = null;
    this.imageSrc = getEmptyImage();
  }

  ngAfterViewInit() {
    this.editor = initTextEditor('#editor-container', 'News Bulletin Content');
  }

  ngOnDestroy() {
    
  }

  onTitleInput() {
    
  }

  getDescription() {
    var description = "";
    
    var data = this.editor.getContents();
    Object.keys(data.ops).map(item => {
      description += data.ops[item].insert;
    });

    return description;
  }

  onImageChange(event: Event) {
    this.image = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageSrc = reader.result;
    };
    reader.readAsDataURL(this.image);
  }

  addNewsItem(event: Event, status?: NewsItemStatus) {
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
    if (status) {
      this.status = status;
    }
    this.newsbulletins.add({
      title: this.title,
      description: this.getDescription(),
      addTime: new Date(this.key_date),
      key_date: this.key_date,
      imagePath: this.image,
      status: this.status
    }).then(() => {
      this.alert.success(this.i18n.get('PostAdded'), false, 5000, true);
      this.navigation.redirectTo('newsbulletins', 'list');
    }).catch((error: Error) => {
      this.alert.error(error.message);
    }).finally(() => {
      stopLoading();
    });
  }

  publishNewsItem(event: Event) {
    this.addNewsItem(event, NewsItemStatus.Published);
  }

}
