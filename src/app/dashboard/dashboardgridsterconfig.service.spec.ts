import { TestBed, inject } from '@angular/core/testing';

import { DashboardgridsterconfigService } from './dashboardgridsterconfig.service';

describe('DashboardgridsterconfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardgridsterconfigService]
    });
  });

  it('should be created', inject([DashboardgridsterconfigService], (service: DashboardgridsterconfigService) => {
    expect(service).toBeTruthy();
  }));
});
