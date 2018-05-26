import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BucketsAggregaComponent } from './buckets-aggrega.component';

describe('BucketsAggregaComponent', () => {
  let component: BucketsAggregaComponent;
  let fixture: ComponentFixture<BucketsAggregaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BucketsAggregaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BucketsAggregaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
