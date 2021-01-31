import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsbulletinsEditComponent } from './newsbulletins-edit.component';

describe('NewsbulletinsEditComponent', () => {
  let component: NewsbulletinsEditComponent;
  let fixture: ComponentFixture<NewsbulletinsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsbulletinsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsbulletinsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
