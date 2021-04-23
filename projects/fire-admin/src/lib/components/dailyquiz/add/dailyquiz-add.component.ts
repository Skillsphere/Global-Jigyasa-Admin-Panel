import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { I18nService } from '../../../services/i18n.service';
import { AlertService } from '../../../services/alert.service';
import { NavigationService } from '../../../services/navigation.service';
import { initTextEditor } from '../../../helpers/posts.helper';
import { DailyQuizService } from '../../../services/collections/dailyquiz.service';
import { QuestionBlock } from '../../../models/collections/quiz.model';
import { Observable, range } from 'rxjs';
import { getEmptyImage } from '../../../helpers/assets.helper';

@Component({
  selector: 'fa-pages-add',
  templateUrl: './dailyquiz-add.component.html',
  styleUrls: ['./dailyquiz-add.component.css']
})
export class DailyQuizAddComponent implements OnInit {

  title: string;
  pushMessage: string;
  editor: any;
  blocks: QuestionBlock[] = [];
  description: string;
  key_date: string;
  imageUrl: string | File | Observable<string> | { path: any; url: string | Observable<string>; };
  private quizImage: File;
  private image: File;
  imageSrc: string|ArrayBuffer;
  questionImageSrc: string[]|ArrayBuffer[] = [];
  totalTime: number;
  isImageEmpty: boolean = true;
  isSubmitButtonDisabled: boolean = true;

  constructor(
    private settings: SettingsService,
    private i18n: I18nService,
    private quiz: DailyQuizService,
    private alert: AlertService,
    private navigation: NavigationService
  ) { }

  ngOnInit() {
    this.imageSrc = getEmptyImage();
    this.image = null;
    this.key_date = new Date().toISOString().slice(0, 10);
    this.totalTime = 10;
  }

  ngAfterViewInit() {
    this.editor = initTextEditor('#editor-container', 'Quiz Description');
    this.editor.on('text-change', () => {
      this.isSubmitButtonDisabled = !(this.editor.getLength() > 1);
    });
  }

  onTitleInput() {
    
  }

  onNotificationInput() {
    
  }

  addBlock(event?: Event) {
    this.questionImageSrc.push(null);
    
    this.blocks.push({
      question: '',
      answerType: 1,
      imageUrl: '',
      answerOptions: [
        {
          title: '',
          isAnswer: true,
          imageUrl: ''
        },
        {
          title: '',
          isAnswer: false,
          imageUrl: ''
        },
        {
          title: '',
          isAnswer: false,
          imageUrl: ''
        },
        {
          title: '',
          isAnswer: false,
          imageUrl: ''
        },
      ]
    });
  }

  removeBlock(index: number) {
    this.blocks.splice(index, 1);
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
    this.quizImage = (event.target as HTMLInputElement).files[0];
    this.isImageEmpty = (this.quizImage == null);
    const reader = new FileReader();
    reader.onload = () => {
      this.imageSrc = reader.result;
    };
    reader.readAsDataURL(this.quizImage);
  }

  onQuestionImageChange(event: Event, index: number) {
    this.image = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.questionImageSrc[index] = reader.result;
    };
    reader.readAsDataURL(this.image);
  }

  addQuiz(event: Event) {
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
      description: this.getDescription(),
      key_date: this.key_date,
      imageUrl: this.image,
      totalTime: this.totalTime,
      isActive: true,
      blocks: this.blocks
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
