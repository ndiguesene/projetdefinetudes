import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthentificationPortailComponent } from './authentification-portail.component';

describe('AuthentificationPortailComponent', () => {
  let component: AuthentificationPortailComponent;
  let fixture: ComponentFixture<AuthentificationPortailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthentificationPortailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthentificationPortailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
