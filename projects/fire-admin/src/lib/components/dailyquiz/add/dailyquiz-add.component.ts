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
  key_date: string;
  imageUrl: string | File | Observable<string> | { path: any; url: string | Observable<string>; };
  private quizImage: File;
  imageSrc: string|ArrayBuffer;
  totalTime: number;

  private questionImages: File[] = [];
  questionImageSrc: (string|ArrayBuffer)[] = [];
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
    this.quizImage = null;
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

  toggleAnswerOption(event: Event, questionIndex: number, optionIndex: number) {
    this.blocks[questionIndex].answerOptions.forEach((ans, i) => {
      if(i == optionIndex) {
        ans.isAnswer = true;
      } else {
        ans.isAnswer = false;
      }
    });
  }

  addBlock(event?: Event) {
    this.questionImageSrc.push(getEmptyImage());
    this.questionImages.push(null);
    
    this.blocks.push({
      question: '',
      answerType: 1,
      imageUrl: '',
      answerOptions: [
        {
          title: '',
          isAnswer: true,
          key: '',
          imageUrl: null
        },
        {
          title: '',
          isAnswer: false,
          key: '',
          imageUrl: null
        },
        {
          title: '',
          isAnswer: false,
          key: '',
          imageUrl: null
        },
        {
          title: '',
          isAnswer: false,
          key: '',
          imageUrl: null
        },
      ]
    });
  }

  removeBlock(index: number) {
    this.blocks.splice(index, 1);
    this.questionImageSrc.splice(index, 1);
    this.questionImages.splice(index, 1);
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
    this.questionImages[index] = (event.target as HTMLInputElement).files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.questionImageSrc[index] = reader.result;
    };
    reader.readAsDataURL(this.questionImages[index]);

    this.blocks[index].imageUrl = this.questionImages[index];
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
      push_notification_message: this.pushMessage,
      key_date: this.key_date,
      imageUrl: this.quizImage,
      totalTime: this.totalTime * 60000, // time in millis
      isActive: true,
      blocks: this.blocks
    }).then(() => {
      this.alert.success(this.i18n.get('QuizAdded'), false, 5000, true);
      this.navigation.redirectTo('dailyquiz', 'list');
    }).catch((error: Error) => {
      this.alert.error(error.message);
    }).finally(() => {
      stopLoading();
    });
  }
}

// HELPER
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array

// let unshuffled = ['hello', 'a', 't', 'q', 1, 2, 3, {cats: true}]

// let shuffled = unshuffled
//   .map((a) => ({sort: Math.random(), value: a}))
//   .sort((a, b) => a.sort - b.sort)
//   .map((a) => a.value)
