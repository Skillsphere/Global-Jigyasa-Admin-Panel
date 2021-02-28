import { Component, OnInit } from '@angular/core';
import { slugify } from '../../../helpers/functions.helper';
import { SettingsService } from '../../../services/settings.service';
import { PageBlock, PageBlockType } from '../../../models/collections/page.model';
import { I18nService } from '../../../services/i18n.service';
import { AlertService } from '../../../services/alert.service';
import { NavigationService } from '../../../services/navigation.service';
import { initTextEditor } from '../../../helpers/posts.helper';
import { DailyQuizService } from '../../../services/collections/dailyquiz.service';

@Component({
  selector: 'fa-pages-add',
  templateUrl: './dailyquiz-add.component.html',
  styleUrls: ['./dailyquiz-add.component.css']
})
export class DailyQuizAddComponent implements OnInit {

  title: string;
  editor: any;
  blocks: PageBlock[] = [];
  blockTypes: { label: string, value: PageBlockType }[] = [];

  constructor(
    private settings: SettingsService,
    private i18n: I18nService,
    private quiz: DailyQuizService,
    private alert: AlertService,
    private navigation: NavigationService
  ) { }

  ngOnInit() {
    this.blockTypes = Object.keys(PageBlockType).map((key: string) => {
      return { label: key, value: PageBlockType[key] };
    });
    //this.addBlock();
  }

  ngAfterViewInit() {
    this.editor = initTextEditor('#editor-container', 'Quiz Description');
  }

  onTitleInput() {
    
  }

  addBlock(event?: Event) {
    this.blocks.push({
      name: '',
      type: PageBlockType.Text,
      content: ''
    });
  }

  removeBlock(index: number) {
    this.blocks.splice(index, 1);
  }

  onBlockNameInput(block: PageBlock) {
    block.key = slugify(block.name);
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
      lang: this.language,
      title: this.title,
      slug: this.slug,
      blocks: this.pages.formatBlocks(this.blocks)
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
