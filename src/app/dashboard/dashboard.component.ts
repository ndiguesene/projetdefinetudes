import { DashboardGridsterConfigService } from './dashboardgridsterconfig.service';
import { Config } from './../config/Config';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { ElasticsearchService } from '../services/elasticsearch.service';

import { GridsterConfig, GridsterItem, GridType, CompactType } from 'angular-gridster2';
import { BucketsService } from '../services/buckets.service';
import { MetricsService } from '../services/metrics.service';

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

  inputRecherche = 'a';

  config: GridsterConfig;
  listeVisualisationInDashboard: Array<GridsterItem>;
  visuaObject: any;
  resultatFiltre: any;

  constructor(private es: ElasticsearchService,
              private router: Router,
              private dashboardGridsterConfigService: DashboardGridsterConfigService,
              private buck: BucketsService,
              private met: MetricsService) {}

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
        this.listeVisualisation = this.dataAllPortail;
      }
    );
    this.listeVisualisationInDashboard = [];
    this.config = this.dashboardGridsterConfigService.getConfig();
  }
  // recherche(event: any) {
  //   this.inputRecherche = event.target.value;
  //   this.es.fullTextSearchService(Config.INDEX.NOM_INDEX_FOR_MAPPING, this.inputRecherche).then(
  //     res => {
  //       this.listeVisualisation = res.hits.hits;
  //       if (this.inputRecherche === '') {
  //         this.listeVisualisation = this.listeVisualisationAll;
  //       }
  //     }
  //   );
  // }
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
  // tslint:disable-next-line:member-ordering
  static itemResize(item, itemComponent) {
    console.log('itemResized', item, itemComponent);
  }
  changedOptions() {
    this.config.api.optionsChanged();
  }
  removeItem(item) {
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
