import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsbulletinsAddComponent } from './newsbulletins-add.component';

describe('NewsbulletinsAddComponent', () => {
  let component: NewsbulletinsAddComponent;
  let fixture: ComponentFixture<NewsbulletinsAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsbulletinsAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsbulletinsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
