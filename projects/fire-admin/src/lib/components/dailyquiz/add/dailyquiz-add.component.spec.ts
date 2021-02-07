import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyQuizAddComponent } from './dailyquiz-add.component';

describe('DailyQuizAddComponent', () => {
  let component: DailyQuizAddComponent;
  let fixture: ComponentFixture<DailyQuizAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyQuizAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyQuizAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
