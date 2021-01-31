import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsbulletinsListComponent } from './newsbulletins-list.component';

describe('NewsbulletinsListComponent', () => {
  let component: NewsbulletinsListComponent;
  let fixture: ComponentFixture<NewsbulletinsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsbulletinsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsbulletinsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
