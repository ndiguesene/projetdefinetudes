import { Config } from './../config/Config';
import { ElasticsearchService } from '../services/elasticsearch.service';

import { BucketsService } from '../services/buckets.service';
import { Component, OnInit, ViewChildren, QueryList, ViewChild, ChangeDetectorRef } from '@angular/core';


import { GridsterConfig, GridsterItem } from 'angular-gridster2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  listeIndex: any;
  dataAllPortail = [];
  listeVisualisation = [];

  inputRecherche = 'a';
  listeVisualisationInDashboard: Array<any>;
  visuaObject: any;
  resultatFiltre: any;

  public lineChartData: Array<any> = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  public lineChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartType = 'line';
  public pieChartType = 'pie';

  // Pie
  public pieChartLabels: string[] = ['Download Sales', 'In-Store Sales', 'Mail Sales'];
  public pieChartData: number[] = [300, 500, 100];


  options: GridsterConfig;
  dashboard: Array<GridsterItem>;

  constructor(private es: ElasticsearchService,
              private buck: BucketsService,
              private cd: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.es.getAllDocumentsService(
      Config.INDEX.NOM_INDEX_FOR_MAPPING,
      Config.INDEX.TYPE,
      Config.NAME_FIELD_OF_MAPPING.VISUALIZATION).then(
      async res => {
        this.dataAllPortail = await Object.values(res.hits.hits);
        await this.dataAllPortail.map(async visua => {
          /**
           *  ici vu que le contenu de l'objet enregistré dans la base est un objet qu'on a converti
           * en string , on le parse pour recupérer l'objet en tant que tel
           **/
          visua['_source'].visualization.visState = await JSON.parse(visua['_source'].visualization.visState);
        });
        this.listeVisualisation = await this.dataAllPortail;
      }
    );
    this.dashboard = [
      {cols: 2, rows: 1, y: 0, x: 0},
      {cols: 2, rows: 2, y: 0, x: 2}
    ];
  }
  getAllIndex() {
    this.es.getAllIndexService().then(
      resp => {
        this.listeIndex = resp;
      }
    );
  }

  // tslint:disable-next-line:member-ordering
  static itemChange(item, itemComponent) {
    console.log('itemChanged', item, itemComponent);
  }
  // tslint:disable-next-line:member-ordering
  static itemResize(item, itemComponent) {
    console.log('itemResized', item, itemComponent);
  }
  changedOptions() {

  }
  removeItem($event, item) {
    $event.preventDefault();
    $event.stopPropagation();
    this.listeVisualisationInDashboard.splice(this.listeVisualisationInDashboard.indexOf(item), 1);
  }
  addItem(id) {
    this.es.getByIdService(Config.INDEX.NOM_INDEX_FOR_MAPPING, id).then(
      res => {
        this.visuaObject = res.hits.hits[0]._source.visualization;
        this.visuaObject.visState = JSON.parse(this.visuaObject.visState);
        if (this.visuaObject.visState.name_type_chart === 'metrics') {
          this.es.getSearchWithAgg(
            this.visuaObject.visState.index, this.visuaObject.visState.aggregation.aggreg, 100
          ).then(
            async resp => {
              this.resultatFiltre =  {
                value: this.buck.getResultFilterAggregationBucket(resp).value,
                title: this.visuaObject.title,
                description: this.visuaObject.description
              };
              this.listeVisualisationInDashboard.push({});
            }
          );
        } else {
          alert('non metrics');
        }
      }
    );
    // this.listeVisualisationInDashboard.push();
  }
}
