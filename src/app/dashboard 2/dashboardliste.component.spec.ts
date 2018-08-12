import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardlisteComponent } from './dashboardliste.component';

describe('DashboardlisteComponent', () => {
  let component: DashboardlisteComponent;
  let fixture: ComponentFixture<DashboardlisteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardlisteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardlisteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
