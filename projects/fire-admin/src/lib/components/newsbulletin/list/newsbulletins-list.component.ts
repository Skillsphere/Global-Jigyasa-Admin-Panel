import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject, Subscription, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { refreshDataTable } from '../../../helpers/datatables.helper';
import { AlertService } from '../../../services/alert.service';
import { NavigationService } from '../../../services/navigation.service';
import { I18nService } from '../../../services/i18n.service';
import { ActivatedRoute } from '@angular/router';
import { CurrentUserService } from '../../../services/current-user.service';
import { Newsbulletin, NewsItemStatus } from '../../../models/collections/newsbulletin.model';
import { NewsbulletinsService } from '../../../services/collections/newsbulletin.service';

@Component({
  selector: 'fa-posts-list',
  templateUrl: './newsbulletins-list.component.html',
  styleUrls: ['./newsbulletins-list.component.css']
})
export class NewsbulletinsListComponent implements OnInit, OnDestroy {

  allNewsbulletins: Observable<Newsbulletin[]>;
  selectedNewsbulletin: Newsbulletin = null;
  @ViewChild(DataTableDirective, {static : false}) private dataTableElement: DataTableDirective;
  dataTableOptions: DataTables.Settings|any = {
    responsive: true,
    aaSorting: []
  };
  dataTableTrigger: Subject<void> = new Subject();
  private subscription: Subscription = new Subscription();
  allStatus: { labels: object, colors: object };
  private routeParamsChange: Subject<void> = new Subject<void>();
  isLoading: boolean = true;

  constructor(
    private newsbulletins: NewsbulletinsService,
    private alert: AlertService,
    private i18n: I18nService,
    private route: ActivatedRoute,
    public navigation: NavigationService,
    public currentUser: CurrentUserService
  ) { }

  ngOnInit() {
    // Get all status
    this.allStatus = this.newsbulletins.getAllStatusWithColors();
    
    //Get route params
    this.subscription.add(
      this.route.params.subscribe((params: { status: string, categoryId: string, authorId: string }) => {
        this.routeParamsChange.next();
        this.isLoading = true;
        // Get all posts
        this.allNewsbulletins = this.newsbulletins.getWhereFn(ref => {
          let query: any = ref;
          // Filter by status
          if (params.status) {
            query = query.where('status', '==', params.status);
          }
          
          // Filter by author
          else if (params.authorId) {
            query = query.where('createdBy', '==', params.authorId);
          }
          //query = query.orderBy('createdAt', 'desc'); // requires an index to work
          return query;
        }, true).pipe(
          map((newsbulletins: Newsbulletin[]) => {
            return newsbulletins.sort((a: Newsbulletin, b: Newsbulletin) => b.createdAt - a.createdAt);
          }),
          takeUntil(this.routeParamsChange)
        );
        this.subscription.add(
          this.allNewsbulletins.subscribe((newsbulletins: Newsbulletin[]) => {
            console.log(newsbulletins);
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

  private setNewsbulletinStatus(event: Event, newsbulletin: Newsbulletin, status: NewsItemStatus) {
    const target = event.target as any;
    target.disabled = true;
    this.newsbulletins.setStatus(newsbulletin.id, status).catch((error: Error) => {
      this.alert.error(error.message);
      target.disabled = false;
    });
  }

  publishPost(event: Event, newsbulletin: Newsbulletin) {
    this.setNewsbulletinStatus(event, newsbulletin, NewsItemStatus.Published);
  }

  moveToTrash(event: Event, newsbulletin: Newsbulletin) {
    this.setNewsbulletinStatus(event, newsbulletin, NewsItemStatus.Trash);
  }

  deletePost(newsbulletin: Newsbulletin) {
    this.newsbulletins.delete(newsbulletin.id, {
      imagePath: (newsbulletin.imagePath as any).path as string
    }).then(() => {
      this.alert.success(this.i18n.get('PostDeleted', { title: newsbulletin.title }), false, 5000);
    }).catch((error: Error) => {
      this.alert.error(error.message);
    });
  }

}
