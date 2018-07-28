import { DatePipe } from '@angular/common';
import { ChartService } from './../services/chart.service';
import { Config } from './../config/Config';
import { ElasticsearchService } from '../services/elasticsearch.service';

import { BucketsService } from '../services/buckets.service';
// tslint:disable-next-line:max-line-length
import { Component, OnInit, ViewChildren, QueryList, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';


import { GridsterConfig, GridsterItem, DisplayGrid, GridType, CompactType } from 'angular-gridster2';

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

  resultFilterDateHistogram = [];
  resultFilterDateHistogramShowInHtml = [];
  resultFilterRangeAggregration = [];

  nomAggregation = '';
  nomChampSelectionner = '';
  chartData: any;
  chartLabels = [];
  listeBucketsAggrega = [];

  inputRecherche = 'a';
  listeVisualisationInDashboard = Array<GridsterData>();
  gridster: GridsterData;
  visuaObject: any;
  resultatFiltre: any;

  nomDiagramme = '';

  public lineChartData: Array<any> = [];
  public lineChartLabels: Array<any> = [];
  public lineChartType = '';

  options: GridsterConfig;
  addMetricsVisua = 0;
  option: any = {
    responsive: true,
    legend: {
      position: 'top',
      display: false
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

  nomIndex = '';
  resultatAllForBucket: any;
  resultatAggregationMetrics = [];

  params: any = {
    nomLabel: '',
    positionLegend: 'top',
    showLabel: true,
    showLegend: true,
    type_bucket: '',
    nom_champ: '',
    typeDateFiltre: '',
    fill: false
  };
  currentChart: any;

  constructor(private es: ElasticsearchService,
              private buck: BucketsService,
              private cd: ChangeDetectorRef,
              private chartService: ChartService,
              private datePipe: DatePipe) {}

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

  ngOnInit() {
    this.options = {
      gridType: GridType.Fit,
      compactType: CompactType.None,
      margin: 10,
      outerMargin: true,
      outerMarginTop: null,
      outerMarginRight: null,
      outerMarginBottom: null,
      outerMarginLeft: null,
      mobileBreakpoint: 640,
      minCols: 1,
      maxCols: 100,
      minRows: 1,
      maxRows: 100,
      maxItemCols: 100,
      minItemCols: 1,
      maxItemRows: 100,
      minItemRows: 1,
      maxItemArea: 2500,
      minItemArea: 1,
      defaultItemCols: 1,
      defaultItemRows: 1,
      fixedColWidth: 105,
      fixedRowHeight: 105,
      keepFixedHeightInMobile: false,
      keepFixedWidthInMobile: false,
      scrollSensitivity: 10,
      scrollSpeed: 20,
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: false,
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      ignoreMarginInRow: false,
      draggable: {
        enabled: true,
      },
      resizable: {
        enabled: true,
      },
      swap: false,
      pushItems: true,
      disablePushOnDrag: false,
      disablePushOnResize: false,
      pushDirections: {north: true, east: true, south: true, west: true},
      pushResizeItems: false,
      displayGrid: DisplayGrid.Always,
      disableWindowResize: false,
      disableWarnings: false,
      scrollToNewItems: false
    };
    this.es.getAllDocumentsService(
      Config.INDEX.NOM_INDEX_FOR_MAPPING,
      Config.INDEX.TYPE,
      Config.NAME_FIELD_OF_MAPPING.VISUALIZATION).then(
      res => {
        this.dataAllPortail = Object.values(res.hits.hits);
        this.dataAllPortail.map(async visua => {
          visua['_source'].visualization.visState = JSON.parse(visua['_source'].visualization.visState);
        });
        this.listeVisualisation = this.dataAllPortail;
      }
    );
  }

  changedOptions() {
    this.options.api.optionsChanged();
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
            this.visuaObject.visState.index, this.visuaObject.visState.aggregation.aggreg, Config.SIZE_MAX_RESULT_QUERY_RETURN
          ).then(
            async resp => {
              this.resultatFiltre =  {
                value: this.buck.getResultFilterAggregationBucket(resp).value,
                title: this.visuaObject.title,
                description: this.visuaObject.description
              };
              this.gridster = {
                _idVisualisation: res.hits.hits[0]._id,
                coordonneeGridster : {x: 0, y: 0, cols: 1, rows: 1},
                value:  this.resultatFiltre,
                addMetricsVisua: 1
              };
            }
          );
        } else {
          this.buck.queryDateHistoGrammAggregation(
            this.visuaObject.visState.index, this.visuaObject.visState.aggregation.aggreg, Config.SIZE_MAX_RESULT_QUERY_RETURN
          ).then(
            async ress => {
                const resultat = {
                  filter_aggregation: this.buck.getResultFilterAggregationBucket(ress),
                  filter_hits: this.buck.getResultFilterHitsBucket(ress),
                  type_bucket: this.visuaObject.visState.aggregation.params.type_bucket,
                  nom_champ: this.visuaObject.visState.aggregation.params.nom_champ,
                  typeDateFiltre: this.visuaObject.visState.aggregation.params.typeDateFiltre,
                  chartLabels: this.visuaObject.visState.aggregation.params.chartLabels,
                  query: this.visuaObject.visState.aggregation.aggreg,
                  typeOfaggregationSwtich: this.visuaObject.visState.aggregation.typeOfaggregationSwtich
                };
                this.nomDiagramme = this.visuaObject.visState.name_type_chart;
                resultat.filter_aggregation.map(
                  r => {
                    this.lineChartData.push(r.doc_count);
                    this.lineChartLabels.push(r.key_as_string);
                  }
                );
              // this.filtreHitsChangeBucket(resultat);
            }
          );
          // this.nomDiagramme = this.visuaObject.visState.name_type_chart;
          this.gridster = {
            _idVisualisation: res.hits.hits[0]._id,
            coordonneeGridster : {x: 0, y: 0, cols: 1, rows: 1, label: 'Informations sur le label'},
            value:  this.resultatFiltre,
            addMetricsVisua: 2
          };
        }
      }
    );
    this.listeVisualisationInDashboard.push(this.gridster);
    this.listeVisualisationInDashboard = this.listeVisualisationInDashboard.filter(
      liste => liste !== undefined
    );
  }

  randomColor(opacity: number): string {
    // tslint:disable-next-line:max-line-length
    return 'rgba(' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + (opacity || '.3') + ')';
  }

  filtreHitsChangeBucket(resultat: any) {
      if (this.resultFilterDateHistogram) {
        if (resultat['type_bucket'] === 'date_histogram') {
          this.resultFilterDateHistogram.push({
            id: this.resultFilterDateHistogram.length + 1,
            data: resultat['filter_aggregation'],
            dataMutliChart: resultat['filter_hits'],
            type_bucket: resultat['type_bucket'],
            nom_champ: resultat['nom_champ'],
          });
        } else if (resultat['type_bucket'] === 'date_range') {
          this.resultFilterDateHistogram.push({
            id: this.resultFilterDateHistogram.length + 1,
            data: resultat['filter_hits'],
            dataAggregation: resultat['filter_aggregation'],
            type_bucket: resultat['type_bucket'],
            nom_champ: resultat['nom_champ'],
            chartLabels: resultat['chartLabels'],
            fieldBucketsChoiceDate: resultat['fieldBucketsChoiceDate']
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
          // this.resultatMetrics();
        } else {
          let chaineObjectData = '';
          if (resultat['type_bucket'] === 'date_histogram') {
            if (resultat['filtreAvecMultiChart'] === true) {
              this.chartData = [];
              this.chartLabels = [];
              /**
               * C'est dans cette partie qu'on va faire les plusieurs graphes
               */
              let dataTab;
              dataTab = [];
              this.chartData = [];
              if (resultat['typeDateFiltre'] === 'year') {
                let name_field_aggrega_for_result = '';
                for (const ite of resultat['filter_aggregation']) {

                  if (resultat['typeOfaggregationSwtich'] === 'null' || resultat['typeOfaggregationSwtich'] === 'count') {
                    dataTab.push(ite.doc_count);
                    this.chartLabels.push(ite.key_as_string.toString().split('-')[0] + ' : ' + ite.doc_count);
                  } else {
                    name_field_aggrega_for_result = 'agg_' + resultat['typeOfaggregationSwtich'] + '_' + resultat['nom_champ'];
                    if (ite[name_field_aggrega_for_result].value === null) {
                      dataTab.push(0);
                    } else {
                      dataTab.push(ite[name_field_aggrega_for_result].value);
                    }
                    this.chartLabels.push(ite.key_as_string.toString().split('-')[0] + ' : ' + ite[name_field_aggrega_for_result].value);
                  }
                }
                const chartColor = [];
                for (const iterator of dataTab) {
                  chartColor.push(this.randomColor(1));
                }
                this.chartData.push(
                  {
                    label: resultat['nom_champ'], // dans la variable données ai la valeur de l'année comme ID
                    fill: this.params.fill,
                    data : dataTab,
                    backgroundColor: chartColor,
                  }
                );
              } else { // si le type de filtre en interval est en Mois ou jour
                const name_field_aggrega_for_result = 'agg_' + resultat['typeOfaggregationSwtich'] + '_' + resultat['nom_champ'];
                if (resultat['typeOfaggregationSwtich'] === 'null' ||
                  resultat['typeOfaggregationSwtich'] === 'count') {

                  // tslint:disable-next-line:radix
                  const debut = parseInt(resultat['filter_aggregation'][0].key_as_string.toString().split('-')[0]);
                  for (let i = debut; i <= resultat['range'].date_fin; i++) {
                    // let month;
                    let j = 0;
                    for (const ite of resultat['filter_aggregation']) {
                      let val = 0;
                      // tslint:disable-next-line:radix
                      val = parseInt(ite.key_as_string.toString().split('-')[0]);
                      if (i === val) {
                        if (ite.doc_count === null) {
                          dataTab[j] = 0;
                        } else {
                          dataTab[j] = ite.doc_count;
                        }
                        if (val > i) {
                          break;
                        }
                        // month = this.convertValueMonthInLetter(ite.key_as_string.toString().split('-')[1]);
                        this.chartLabels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
                                            'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                        j++;
                      }
                    }
                    const objec = {
                      label: i, // dans la variable données ai la valeur de l'année comme ID
                      fill: this.params.fill,
                      data : dataTab,
                      backgroundColor: this.randomColor(1)
                    };
                    chaineObjectData += JSON.stringify(objec) + ',';
                  }

                } else {
                  // tslint:disable-next-line:radix
                  const debut = parseInt(resultat['filter_aggregation'][0].key_as_string.toString().split('-')[0]);
                  for (let i = debut; i <= resultat['range'].date_fin; i++) {
                    // let month;
                    let j = 0;
                    for (const ite of resultat['filter_aggregation']) {
                      let val = 0;
                      // tslint:disable-next-line:radix
                      val = parseInt(ite.key_as_string.toString().split('-')[0]);
                      if (i === val) {
                        if (ite[name_field_aggrega_for_result].value === null) {
                          dataTab[j] = 0;
                        } else {
                          dataTab[j] = ite[name_field_aggrega_for_result].value;
                        }
                        j++;
                      }
                      if (val > i) {
                        break;
                      }
                    }
                    const objec = {
                      label: i, // dans la variable données i a  la valeur de l'année comme ID
                      fill: this.params.fill,
                      data : dataTab,
                      backgroundColor: this.randomColor(1)
                    };
                    chaineObjectData += JSON.stringify(objec) + ',';
                  }
                }
                if (this.nomDiagramme === 'line') {
                  this.chartLabels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
                                            'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                }
                // cette instruction permet d'enlever le dernier ',' de la chaine pour apres le paser en json
                chaineObjectData = '[' + chaineObjectData.substring(0, chaineObjectData.length - 1) + ']';
                this.chartData = JSON.parse(chaineObjectData);
              }
              /**
               * Fin de cette partie qu'on va faire les plusieurs graphes
               */
            } else {
              let dataTab: number[];
              dataTab = [];
              const donnees = this.resultFilterDateHistogramShowInHtml['data'];
              // for (const ite of donnees) {
                /**
                 * item_count contient le nombre d'enregistrement de la requete
                 */
                // dataTab.push(ite.doc_count);
                /**
                 * Ce permet de ne afficher que l'année au niveau de l'axe des abscisses
                 */
                // format date: YYYY-MM-DD
                if (resultat['typeDateFiltre'] === 'year') {
                  // this.chartLabels.push(ite.key_as_string.toString().split('-')[0]);
                  for (const ite of donnees) {
                    dataTab.push(ite.doc_count);
                    this.chartLabels.push(ite.key_as_string.toString().split('-')[0] + ' : ' + ite.doc_count);
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
                        fill: this.params.fill,
                        data : dataTab,
                        backgroundColor: chartColor
                      }
                    ];
                  } else {
                    this.chartData = [
                      {
                        label: resultat['nom_champ'],
                        fill: this.params.fill,
                        data : dataTab,
                        backgroundColor: this.randomColor(1)
                      }
                    ];
                  }
                } else { // sinon cest le mois, la semaine ou heure et jour
                  this.chartLabels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet',
                                            'Aout', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

                  // tslint:disable-next-line:radix
                  const debut = parseInt(resultat['filter_aggregation'][0].key_as_string.toString().split('-')[0]);
                  // tslint:disable-next-line:max-line-length
                  // tslint:disable-next-line:radix
                  const date_fin = parseInt(resultat['filter_aggregation'][resultat['filter_aggregation'].length - 1]
                    .key_as_string.toString().split('-')[0]);
                  for (let i = debut; i <= date_fin; i++) {
                    // let month;
                    let j = 0;
                    for (const ite of resultat['filter_aggregation']) {
                      let val = 0;
                      // tslint:disable-next-line:radix
                      val = parseInt(ite.key_as_string.toString().split('-')[0]);
                      if (i === val) {
                        dataTab[j] = ite.doc_count;
                        j++;
                      }
                      if (val > i) {
                        break;
                      }
                    }
                    const objec = {
                      label: i, // dans la variable données ai la valeur de l'année comme ID
                      fill: this.params.fill,
                      data : dataTab,
                      backgroundColor: this.randomColor(1)
                    };
                    chaineObjectData += JSON.stringify(objec) + ',';
                  }
                  chaineObjectData = '[' + chaineObjectData.substring(0, chaineObjectData.length - 1) + ']';
                  this.chartData = JSON.parse(chaineObjectData);
                }
            }
            this.currentChart = this.chartService.tracerChart(
              this.nomDiagramme, 'myChart', this.chartData, this.chartLabels, this.options
            );

            // tslint:disable-next-line:max-line-length
            this.currentChart.options.title.text = 'Diagramme ' + this.nomDiagramme + ' du(des) ' + resultat['typeDateFiltre'] + ' du champ << ' + resultat['nom_champ'] + ' >> ';
            this.chartData = [];
            this.chartLabels = [];
          } else if (resultat['type_bucket'] === 'date_range') {
            let dataTab: number[];
            dataTab = [];
            let donnees = [];
            donnees = resultat['filter_hits'];
            for (const ite of donnees) {
              /**
               * item_count contient le nombre d'enregistrement de la requete
               */
              dataTab.push(ite._source[resultat['nom_champ']]);
              this.chartLabels.push(
                this.datePipe.transform(ite._source[resultat['fieldBucketsChoiceDate']], 'dd-MM-yyyy')
              );
            }
            if (resultat['chartLabels']) {
              this.chartLabels = [];
              for (const ite of resultat['chartLabels']) {
                this.chartLabels.push(ite);
              }
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
                  fill: this.params.fill,
                  data : dataTab,
                  backgroundColor: chartColor
                }
              ];
            } else {
              this.chartData = [
                {
                  label: resultat['nom_champ'],
                  fill: this.params.fill,
                  data : dataTab,
                  backgroundColor: this.randomColor(1)
                }
              ];
            }alert('ok');
            this.currentChart = this.chartService.tracerChart(
              this.nomDiagramme, 'myChart', this.chartData, this.chartLabels, this.option
            );
          }
        }
        this.resultatAllForBucket = resultat;
      }
  }
}

export class GridsterData {
  constructor(
    public _idVisualisation: string,
    public coordonneeGridster: GridsterItem,
    public value: any,
    public addMetricsVisua: number) {}
}
