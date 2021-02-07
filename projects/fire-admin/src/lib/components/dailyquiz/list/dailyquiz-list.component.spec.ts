import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyQuizListComponent } from './dailyquiz-list.component';

describe('DailyQuizListComponent', () => {
  let component: DailyQuizListComponent;
  let fixture: ComponentFixture<DailyQuizListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyQuizListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyQuizListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
