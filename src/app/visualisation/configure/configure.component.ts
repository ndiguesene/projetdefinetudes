import { AggregationData } from './../../entities/aggregationData';
import { Config } from './../../config/Config';
import { MetricsService } from './../../services/metrics.service';
import { ElasticsearchService } from './../../services/elasticsearch.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartService } from '../../services/chart.service';

import 'rxjs/add/operator/map';
import { Chart } from 'chart.js';
import { VisualizationObj } from '../../entities/visualizationObj';

import * as bodybuilder from 'bodybuilder';
import { BucketsService } from '../../services/buckets.service';

@Component({
  selector: 'app-configure',
  templateUrl: './configure.component.html',
  styleUrls: ['./configure.component.css']
})
export class ConfigureComponent implements OnInit {
  nomDiagramme = '';
  nomIndex = '';
  resultatAllForBucket: any;
  resultatAggregationMetrics = [];

  currentChart: any;

  listFieldString: string[];
  listFieldNumber: string[];
  nomTypeChoiceIndex = '';
  data: number[];


  listeChart = [];
  listeOperationsMetrics = this.metr.listeOperationsMetrics;

  nomAggregation = '';
  nomChampSelectionner = '';
  chartData: any;
  chartLabels = [];
  listeBucketsAggrega = [];

  resultFilterDateHistogram = [];
  resultFilterDateHistogramShowInHtml = [];
  resultFilterRangeAggregration = [];
  loading = false;

  aggs: AggregationData;

  objectVisualizationSave = {
    type: 'visualization',
    visualization:  {
      description: '',
      title: '',
      uiStateJSON: {},
      version: 1,
      visState: {}
    }
  };
  /**
   * Parametres objet visualisation
   */
  params: any = {
    nomLabel: '',
    positionLegend: 'top',
    showLabel: true,
    showLegend: true,
    type_bucket: '',
    nom_champ: '',
    typeDateFiltre: ''
  };
    /**
         * Cette  variable permet de faire la configuration de notre chart
         */
  options: any = {
    responsive: true,
    legend: {
      position: 'top',
      display: true
    },
    title: {
      display: true,
      text: this.nomDiagramme
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    pan: {
      enabled: true,
      mode: 'xy'
    },
    zoom: {
      enabled: true,
      mode: 'xy'
    }
  };

  constructor(private route: ActivatedRoute,
              private chartService: ChartService,
              private es: ElasticsearchService,
              private metr: MetricsService,
              private buck: BucketsService) {
  }
  randomColor(opacity: number): string {
    // tslint:disable-next-line:max-line-length
    return 'rgba(' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + (opacity || '.3') + ')';
  }
  async ngOnInit() {
    this.route.params.subscribe( params => {
      this.nomDiagramme = params.id.toString();
    });
    // Pour recupérer les parametres passé en URL
    // index est le nom du parametre
    this.route.queryParamMap.subscribe(async params => {
      if (params.get('index')) {
        this.nomIndex = params.get('index');
      } else {
        this.nomIndex = this.es.getDefaultIndexService();
      }
      if (params.get('idVisualisation')) {
          const id = params.get('idVisualisation');
          const body = bodybuilder()
            .query('match', 'type', Config.NAME_FIELD_OF_MAPPING.VISUALIZATION)
            .filter('term', '_id', id)
            .build();
          await this.es.existDocument(Config.INDEX.NOM_INDEX_FOR_MAPPING, Config.INDEX.TYPE, body).then(
            async resp => {
              if (resp[0].isExist === true) {
                const visState = JSON.parse(resp[0].data[0]._source.visualization.visState);
                this.aggs = visState.aggregation;
                // vérifie si le type de traitement qu'on doit faire est de type metrics ou buckets
                if (this.nomDiagramme !== 'metrics') {
                  this.buck.queryDateHistoGrammAggregation(
                    visState.index, this.aggs.aggreg
                  ).then(
                    async res => {
                        const resultat = {
                          filter_aggregation: this.buck.getResultFilterAggregationBucket(res),
                          filter_hits: this.buck.getResultFilterHitsBucket(res),
                          type_bucket: this.aggs.params.type_bucket,
                          nom_champ: this.aggs.params.nom_champ,
                          typeDateFiltre: this.aggs.params.typeDateFiltre
                        };
                      this.filtreHitsChangeBucket(resultat);
                    }
                  );
                } else {
                  // this.aggs.type = [0].objectResult.aggregation
                  // console.log(this.aggs);

                  this.es.getSearchWithAgg(visState.index, this.aggs.aggreg).then(
                    async res => {
                      this.indexChangeFiltreMetrics(
                        this.metr._getAggResult(res, this.aggs.params)
                      );
                    }
                  );
                }
              } else {
                alert('non ok');
              }
            }
          );
      } else {
        // this.nomIndex = this.es.getDefaultIndexService();
      }
    });
    this.loadListFieldOnView(this.nomIndex);
  }
  selectNameAggregation(event: any) {
    const element = event.target.value;
    this.nomAggregation = element;
  }
  async resultatDesDonneesChart() {

  }
  async resultatMetrics() {
    if (this.nomAggregation && this.nomChampSelectionner && this.nomIndex) {

    }
  }
  async loadListFieldOnView(index: string) {
    await this.es.getAllDocumentsService(index, '').then(
      res => {
        this.data = res.hits.hits;
        /**
         * On essai d'acceder au champ _source pour recupérer la liste des objets
         */
        this.data = this.data.map(
          ele => this.data = ele['_source']
        );
      }
    );
    let type;
    await this.es.getNameType(index).then(re => type = re);

    await this.es.getAllFieldsByIndexService(index, type).then(
      res => {
        this.listFieldString = res[index].mappings;
        this.listFieldString = Object.keys(this.listFieldString[type]);
        // Ici on applique un filtre pour ne sélectionner que les champs qui nous intéressent
        // en enlevant les champs commencant par '_' et terminant par .keyword
        this.listFieldString = this.listFieldString.filter(
          el => (!el.startsWith('_')) && (!el.startsWith('@')) && (!el.endsWith('.keyword')
          && (el !== '_index') && (el !== '_type') && (el !== '_id'))
        ).sort();

        this.es.getIndexNumFields(index).then(
          respp => this.listFieldNumber = respp
        );
      }
    );
  }
  getNameType(index): any {
    this.es.getNameTypeByIndexName(index, this.es.getNameType(index)).then(
      res => {
        return res.aggregations.name_type.buckets[0].key;
      }
    );
    return '';
  }
  onChartClick(event) {
    console.log(event);
  }
  onChartHovered(event) {
    console.log(event);
  }
  newDataPoint(label) {
    // this.chartData.forEach((dataset, index) => {
    //   this.chartData[index] = Object.assign({}, this.chartData[index], {
    //     data: [...this.chartData[index].data, this.dataTab[index]]
    //   });
    // });
    // this.chartLabels = [...this.chartLabels, label];
  }
  indexChangeFiltreMetrics(resultat: any) {
    // Ici on recupere juste les objets de type Array Array qui contient nos resultats
    if (resultat instanceof Array) {
      resultat.forEach(res =>  this.resultatAggregationMetrics.push(
        {
          objectResult: res,
          id: this.resultatAggregationMetrics.length + 1
        }
      ));
    }
  }
  removeMetrics(id: number) {
    if (id) {
      this.resultatAggregationMetrics.map((el, incr) => {
        /**
         * Comparé si idComposant donné en parametre est le meme qu'un id dans le tableau
         * listeMetrics
         */
        if (id === el.id) {
          /**
           * Supprimer l'objet correspondant avec slice
           */
          this.resultatAggregationMetrics.splice(incr, 1);
        }
      });
    }
  }
  // le resulat sera traité ici pour le traitement d'un bucket
  filtreHitsChangeBucket(resultat: any) {
    this.loading = true;
    if (this.resultFilterDateHistogram) {
      if (resultat['type_bucket'] === 'date_histogram') {
        this.resultFilterDateHistogram.push({
          id: this.resultFilterDateHistogram.length + 1,
          data: resultat['filter_aggregation'],
          type_bucket: resultat['type_bucket'],
          nom_champ: resultat['nom_champ']
        });
      } else {
        this.resultFilterDateHistogram.push({
          id: this.resultFilterDateHistogram.length + 1,
          data: resultat['filter_hits'],
          type_bucket: resultat['type_bucket'],
          nom_champ: resultat['nom_champ'],
          fieldBucketsChoiceForFilter: resultat['fieldBucketsChoiceForFilter']
        });
      }
      this.resultFilterDateHistogramShowInHtml = this.resultFilterDateHistogram[this.resultFilterDateHistogram.length - 1];
      if (this.nomDiagramme === 'metrics') {
        this.resultatMetrics();
      } else {
        if (resultat['type_bucket'] === 'date_histogram') {
          let i;
          i = 0;
          let dataTab: number[];
          const taille = this.resultFilterDateHistogramShowInHtml['data'].length;
          dataTab = [];
          const donnees = this.resultFilterDateHistogramShowInHtml['data'];
          for (const ite of donnees) {
            /**
             * item_count contient le nombre d'enregistrement de la requete
             */
            dataTab.push(ite.doc_count);
            /**
             * Ce permet de ne afficher que l'année au niveau de l'axe des abscisses
             */
            // format date: YYYY-MM-DD
            if (resultat['typeDateFiltre'] === 'year') {
              // this.chartLabels.push(ite.key_as_string.toString().split('-')[0]);
              this.chartLabels.push(ite.key_as_string.toString().split('-')[0]);
            } else if (resultat['typeDateFiltre'] === 'month') {
              /**
               * 'month' contient la valeur du mois ,qui sera convertit en valeur lettrée (ex: 1=Janvier...)
               */
              const month = this.convertValueMonthInLetter(ite.key_as_string.toString().split('-')[1]);
              /*this.chartLabels.push(
                month + '-' + ite.key_as_string.toString().split('-')[0]
              );*/
              this.chartLabels.push(month + '-' + ite.key_as_string.toString().split('-')[0]);
            } else {
              this.chartLabels.push(ite.key_as_string.toString().split('-')[2]);
            }
          }
          const chartColor = [];
          for (const iterator of dataTab) {
            chartColor.push(this.randomColor(1));
          }
          if (this.nomDiagramme === 'pie' || this.nomDiagramme === 'radar'
            || this.nomDiagramme === 'polarArea' || this.nomDiagramme === 'doughnut') {
            // tslint:disable-next-line:no-shadowed-variable
            const chartColor = [];
            for (const iterator of dataTab) {
              chartColor.push(this.randomColor(1));
            }
            this.chartData = [
              {
                label: resultat['nom_champ'],
                fill: true,
                data : dataTab,
                backgroundColor: chartColor
              }
            ];
          } else {
            this.chartData = [
              {
                label: resultat['nom_champ'],
                fill: true,
                data : dataTab,
                backgroundColor: this.randomColor(1)
              }
            ];
          }
        this.currentChart = this.chartService.tracerChart(
          this.nomDiagramme, 'myChart', this.chartData, this.chartLabels, this.options
        );
        // tslint:disable-next-line:max-line-length
        this.currentChart.options.title.text = 'Diagramme ' + this.nomDiagramme + ' du(des) ' + resultat['typeDateFiltre'] + ' du champ << ' + resultat['nom_champ'] + ' >> ';
        // pour reinitialiser le label vide
        this.chartLabels = [];
        this.chartData = [];
        } else {
          console.log(resultat);
        }
      }
      this.resultatAllForBucket = resultat;
    }
    this.loading = false;
  }
  async saveVisualisation() {
    let type;
    await this.es.getNameType(this.nomIndex).then(async res => {
      type = await res;
    });
    if (this.nomDiagramme !== 'metrics') {
      this.params.type_bucket = this.resultatAllForBucket['type_bucket'];
      this.params.nom_champ = this.resultatAllForBucket['nom_champ'];
      this.params.typeDateFiltre = this.resultatAllForBucket['typeDateFiltre'];
      this.params.nomLabel = this.currentChart.options.title.text;

      const visState = {
        name_type_chart: this.nomDiagramme,
        type: type,
        index: this.nomIndex,
        aggregation: {
          aggreg: this.resultatAllForBucket['query'],
          params: this.params
        }
      };
      this.objectVisualizationSave.type = Config.NAME_FIELD_OF_MAPPING.VISUALIZATION;
      this.objectVisualizationSave.visualization.visState = JSON.stringify(visState);
      this.objectVisualizationSave.visualization.version = 1;
      this.objectVisualizationSave.visualization.uiStateJSON = '';

      this.es.createDoc(Config.INDEX.NOM_INDEX_FOR_MAPPING, Config.INDEX.TYPE, this.objectVisualizationSave);
    } else {
      // si c'est un metrics
      const visState = {
        name_type_chart: this.nomDiagramme,
        type: type,
        index: this.nomIndex,
        aggregation: {
          aggreg: this.resultatAggregationMetrics[0].objectResult.aggregation.params.query,
          params: this.resultatAggregationMetrics[0].objectResult.aggregation
        }
      };
      this.objectVisualizationSave.type = Config.NAME_FIELD_OF_MAPPING.VISUALIZATION;
      this.objectVisualizationSave.visualization.visState = JSON.stringify(visState);
      this.objectVisualizationSave.visualization.version = 1;
      this.objectVisualizationSave.visualization.uiStateJSON = '';

      this.es.createDoc(Config.INDEX.NOM_INDEX_FOR_MAPPING, Config.INDEX.TYPE, this.objectVisualizationSave);
    }
  }
  selectShowLabelChart() {
    this.params.showLabel = !this.params.showLabel;
    this.currentChart.options.title.display = this.params.showLabel;
    this.currentChart.update();
  }
  selectShowLegendChart() {
    this.params.showLegend = !this.params.showLegend;
    this.currentChart.options.legend.display = this.params.showLegend;
    this.currentChart.update();
  }
  loadLabelChart() {
    if (this.params.nomLabel) {
      this.currentChart.options.title.text = this.params.nomLabel;
      this.params.nomLabel = '';
      this.currentChart.update();
    }
  }
  changePositionLegend(event: any) {
    this.params.positionLegend = event.target.value;
    if (this.params.positionLegend) {
      this.currentChart.options.legend.position = this.params.positionLegend;
      this.currentChart.update();
    }
  }
  convertValueMonthInLetter(valeur: string): string {
    // tslint:disable-next-line:radix
    const valNumber = parseInt(valeur);
    switch (valNumber) {
      case 1: return 'Janvier';
      case 2: return 'Février';
      case 3: return 'Mars';
      case 4: return 'Avril';
      case 5: return 'Mai';
      case 6: return 'Juin';
      case 7: return 'Juillet';
      case 8: return 'Aout';
      case 9: return 'Septembre';
      case 10: return 'Octobre';
      case 11: return 'Novembre';
      case 12: return 'Décembre';
      default: return valeur;
    }
  }
}
