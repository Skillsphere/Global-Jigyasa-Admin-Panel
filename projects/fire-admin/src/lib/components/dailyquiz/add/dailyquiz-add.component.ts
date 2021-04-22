import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { I18nService } from '../../../services/i18n.service';
import { AlertService } from '../../../services/alert.service';
import { NavigationService } from '../../../services/navigation.service';
import { initTextEditor } from '../../../helpers/posts.helper';
import { DailyQuizService } from '../../../services/collections/dailyquiz.service';
import { QuestionBlock } from '../../../models/collections/quiz.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'fa-pages-add',
  templateUrl: './dailyquiz-add.component.html',
  styleUrls: ['./dailyquiz-add.component.css']
})
export class DailyQuizAddComponent implements OnInit {

  title: string;
  editor: any;
  blocks: QuestionBlock[] = [];
  description: string;
  key_date: string;
  imageUrl: string | File | Observable<string> | { path: any; url: string | Observable<string>; };
  totalTime: number;
  // blockTypes: { label: string, value: PageBlockType }[] = [];

  constructor(
    private settings: SettingsService,
    private i18n: I18nService,
    private quiz: DailyQuizService,
    private alert: AlertService,
    private navigation: NavigationService
  ) { }

  ngOnInit() {
    // this.blockTypes = Object.keys(PageBlockType).map((key: string) => {
    //   return { label: key, value: PageBlockType[key] };
    // });
    //this.addBlock();
  }

  ngAfterViewInit() {
    this.editor = initTextEditor('#editor-container', 'Quiz Description');
  }

  onTitleInput() {
    
  }

  addBlock(event?: Event) {
    this.blocks.push({
      question: '',
      answerType: 1
    });
  }

  removeBlock(index: number) {
    this.blocks.splice(index, 1);
  }

  onBlockNameInput(block: QuestionBlock) {
    // block.key = slugify(block.name);
  }

  addPage(event: Event) {
    const addButon = event.target as any;
    const startLoading = () => {
      addButon.isLoading = true;
    };
    const stopLoading = () => {
      addButon.isLoading = false;
    };
    startLoading();
    
    this.quiz.add({
      title: this.title,
      description: this.description,
      key_date: this.key_date,
      imageUrl: this.imageUrl,
      totalTime: this.totalTime,
      isActive: true,
      // blocks: this.quiz.formatBlocks(this.blocks)
    }).then(() => {
      this.alert.success(this.i18n.get('PageAdded'), false, 5000, true);
      this.navigation.redirectTo('pages', 'list');
    }).catch((error: Error) => {
      this.alert.error(error.message);
    }).finally(() => {
      stopLoading();
    });
  }
}
