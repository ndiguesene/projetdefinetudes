import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboardliste',
  templateUrl: './dashboardliste.component.html',
  styleUrls: ['./dashboardliste.component.css']
})
export class DashboardlisteComponent implements OnInit {
  listeDashboard = [];
  constructor() { }

  ngOnInit() {
    // this.listeDashboard.push([2, 4, 6]);
  }

}
