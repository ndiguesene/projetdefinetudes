import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricsAggregaComponent } from './metrics-aggrega.component';

describe('MetricsAggregaComponent', () => {
  let component: MetricsAggregaComponent;
  let fixture: ComponentFixture<MetricsAggregaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetricsAggregaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetricsAggregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
