import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationsclusterComponent } from './informationscluster.component';

describe('InformationsclusterComponent', () => {
  let component: InformationsclusterComponent;
  let fixture: ComponentFixture<InformationsclusterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformationsclusterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformationsclusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
