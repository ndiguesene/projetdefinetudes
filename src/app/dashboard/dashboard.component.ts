import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { ElasticsearchService } from '../services/elasticsearch.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  listeIndex: Observable<any>;
  listeDiagramme: string[];
  listeDashBoard: Observable<any>;
  constructor(private es: ElasticsearchService, private router: Router) {}

  ngOnInit() {
    this.es.getAllIndexService().then(
      (res: any) => {
        this.listeIndex = res;
      },
      error => {
        this.listeIndex = error;
      }
    );
  }
  enregitrerDashboard() {
    this.router.navigate(['dashboard']);
  }

}
