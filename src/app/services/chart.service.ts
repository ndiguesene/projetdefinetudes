import { PnotifyService } from './pnotify.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { Chart } from 'chart.js';

@Injectable()
export class ChartService {
  pnotify: any;

  constructor(private ps: PnotifyService) { }

  tracerChart(nomChart: string, id: string, datasets: any, labels: any, options: any): any {
    try {
      const chart = new Chart(document.getElementById(id), {
        type: nomChart,
        data: {
          labels: labels,
          datasets: datasets
        },
        options: options
      });
      return chart;
    } catch (error) {
      return null;
    }
  }
}
