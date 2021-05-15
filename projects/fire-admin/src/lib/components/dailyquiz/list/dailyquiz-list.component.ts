import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { refreshDataTable } from '../../../helpers/datatables.helper';
import { AlertService } from '../../../services/alert.service';
import { NavigationService } from '../../../services/navigation.service';
import { I18nService } from '../../../services/i18n.service';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from '../../../services/settings.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { Quiz } from '../../../models/collections/quiz.model';
import { DailyQuizService } from '../../../services/collections/dailyquiz.service';

@Component({
  selector: 'fa-pages-list',
  templateUrl: './dailyquiz-list.component.html',
  styleUrls: ['./dailyquiz-list.component.css']
})
export class DailyQuizListComponent implements OnInit, OnDestroy {

  allQuizzes: Observable<Quiz[]>;
  selectedQuiz: Quiz = null;
  @ViewChild(DataTableDirective, {static : false}) private dataTableElement: DataTableDirective;
  dataTableOptions: DataTables.Settings|any = {
    responsive: true,
    aaSorting: []
  };
  dataTableTrigger: Subject<void> = new Subject();
  private subscription: Subscription = new Subscription();
  private routeParamsChange: Subject<void> = new Subject<void>();
  isLoading: boolean = true;

  constructor(
    private quizzes: DailyQuizService,
    private alert: AlertService,
    private i18n: I18nService,
    private route: ActivatedRoute,
    public navigation: NavigationService,
    public currentUser: CurrentUserService,
    private settings: SettingsService
  ) { }

  ngOnInit() {
    // Get route params
    this.subscription.add(
      this.route.params.subscribe((params: { authorId: string }) => {
        this.routeParamsChange.next();
        this.isLoading = true;
        // Get all quizzes
        this.allQuizzes = this.quizzes.getWhereFn(ref => {
          let query: any = ref;
          // Filter by author
          if (params.authorId) {
            query = query.where('createdBy', '==', params.authorId);
          }
          //query = query.orderBy('createdAt', 'desc'); // requires an index to work
          return query;
        }, true).pipe(
          map((quizzes: Quiz[]) => {
            return quizzes.sort((a: Quiz, b: Quiz) => b.createdAt - a.createdAt);
          }),
          takeUntil(this.routeParamsChange)
        );
        this.subscription.add(
          this.allQuizzes.subscribe((quizzes: Quiz[]) => {
            // console.log(pages);
            // Refresh datatable on data change
            refreshDataTable(this.dataTableElement, this.dataTableTrigger);
            this.isLoading = false;
          })
        );
      })
    );
  }

  ngOnDestroy() {
    this.dataTableTrigger.unsubscribe();
    this.subscription.unsubscribe();
    this.routeParamsChange.next();
  }

  deleteQuiz(quiz: Quiz) {
    this.quizzes.delete(quiz.id).then(() => {
      this.alert.success(this.i18n.get('Quiz Deleted', { title: quiz.title }), false, 5000);
    }).catch((error: Error) => {
      this.alert.error(error.message);
    });
  }

}
