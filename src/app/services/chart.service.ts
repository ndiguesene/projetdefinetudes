import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { Chart } from 'chart.js';

@Injectable()
export class ChartService {

  constructor() { }

  tracerChart(nomChart: string, id: string, datasets: any, labels: any, options: any): any {
    const chart = new Chart(document.getElementById(id), {
      type: nomChart,
      data: {
        labels: labels,
        datasets: datasets
      },
      options: options
    });
    return chart;
  }
}
