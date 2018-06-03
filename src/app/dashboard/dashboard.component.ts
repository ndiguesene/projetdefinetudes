import { Config } from './../config/Config';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { ElasticsearchService } from '../services/elasticsearch.service';

import { GridsterConfig, GridsterItem, GridType, CompactType } from 'angular-gridster2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  listeIndex: any;
  dataAllPortail = [];
  listeVisualisation = [];

  options: GridsterConfig = {
    gridType: GridType.Fit,
    compactType: CompactType.None,
    pushItems: true,
    draggable: {
      enabled: true
    },
    resizable: {
      enabled: true
    }
  };
  listeDashBoard: Array<GridsterItem>;

  constructor(private es: ElasticsearchService,
              private router: Router) {}

  async ngOnInit() {
    this.listeDashBoard = [
      {cols: 2, rows: 1, y: 0, x: 0},
      {cols: 2, rows: 2, y: 0, x: 2},
      {cols: 1, rows: 1, y: 0, x: 4},
      {cols: 3, rows: 2, y: 1, x: 4},
      {cols: 1, rows: 1, y: 4, x: 5},
      {cols: 1, rows: 1, y: 2, x: 1},
      {cols: 2, rows: 2, y: 5, x: 5},
      {cols: 2, rows: 2, y: 3, x: 2},
      {cols: 2, rows: 1, y: 2, x: 2},
      {cols: 1, rows: 1, y: 3, x: 4},
      {cols: 1, rows: 1, y: 0, x: 6}
    ];

    // await this.es.getAllDocumentsService(
    //   Config.INDEX.NOM_INDEX_FOR_MAPPING,
    //   Config.INDEX.TYPE,
    //   Config.NAME_FIELD_OF_MAPPING.VISUALIZATION).then(
    //   async res => {
    //     this.dataAllPortail = Object.values(res.hits.hits);
    //     await this.dataAllPortail.map(visua => {
    //       /**
    //        *  ici vu que le contenu de l'objet enregistré dans la base est un objet qu'on a converti
    //        * en string , on le parse pour recupérer l'objet en tant que tel
    //        **/
    //       visua['_source'].visualization.visState = JSON.parse(visua['_source'].visualization.visState);
    //     });
    //     this.listeVisualisation = this.dataAllPortail;
    //   }
    // );
    // this.getAllIndex();
  }
  getAllIndex() {
    this.es.getAllIndexService().then(
      resp => {
        this.listeIndex = resp;
      }
    );
  }
  enregitrerDashboard() {
    this.router.navigate(['dashboard']);
  }
  // tslint:disable-next-line:member-ordering
  static itemChange(item, itemComponent) {
    console.log('itemChanged', item, itemComponent);
  }
  static itemResize(item, itemComponent) {
    console.log('itemResized', item, itemComponent);
  }
  changedOptions() {
    this.options.api.optionsChanged();
  }
  removeItem(item) {
    this.listeDashBoard.splice(this.listeDashBoard.indexOf(item), 1);
  }
  addItem() {
    this.listeDashBoard.push();
  }
}
