import { MapService } from './../../services/map.service';
import { PnotifyService } from './../../services/pnotify.service';
import { DatePipe } from '@angular/common';
import { AggregationData } from './../../entities/aggregationData';
import { Config } from './../../config/Config';
import { MetricsService } from './../../services/metrics.service';
import { ElasticsearchService } from './../../services/elasticsearch.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartService } from '../../services/chart.service';

import 'rxjs/add/operator/map';

import * as bodybuilder from 'bodybuilder';
import { BucketsService } from '../../services/buckets.service';
import { ViewChild } from '@angular/core';

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
  pnotify = this.ps.getPNotify();

  objectVisualizationSave = {
    type: Config.NAME_FIELD_OF_MAPPING.VISUALIZATION,
    updated_at: new Date(),
    visualization: {
      description: '',
      title: '',
      uiStateJSON: {},
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
    typeDateFiltre: '',
    fill: false
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
  name_field_aggrega_for_result = '';
  resultatFiltreWithAggregation: any;
  aggregation: AggregationData;

  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;

  localisation: any;

  positions = [];

  userSettings = {};
  constructor(private route: ActivatedRoute,
              private chartService: ChartService,
              private es: ElasticsearchService,
              private metr: MetricsService,
              private buck: BucketsService,
              private datePipe: DatePipe,
              private ps: PnotifyService,
              private mapservice: MapService) {
  }
  randomColor(opacity: number): string {
    // tslint:disable-next-line:max-line-length
    return 'rgba(' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + Math.round(Math.random() * 255) + ',' + (opacity || '.3') + ')';
  }
  onMapReady(map) {
    console.log('map', map);
    console.log('markers', map.markers);  // to get all markers as an array 
  }
  onIdle(event) {
    console.log('map', event.target);
  }
  onMarkerInit(marker) {
    console.log('marker', marker);
  }
  onMapClick(event) {
    this.positions.push(event.latLng);
    event.target.panTo(event.latLng);
  }
  appliquerMarketOnMap() {
    this.es.getAllDocumentsService(this.nomIndex, '').then(
      re => console.log(re)
    );
    this.mapservice.getDecodeAddress('gandiaye').subscribe(
      res => console.log(res)
    );
  }
  async ngOnInit() {
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(re => {
    //     this.positions.push([re.coords.latitude, re.coords.longitude]);
    //   });
    // }
    try {
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
                      visState.index, this.aggs.aggreg, Config.SIZE_MAX_RESULT_QUERY_RETURN
                    ).then(
                      async res => {
                        console.log(this.buck.getResultFilterAggregationBucket(res));
                          const resultat = {
                            filter_aggregation: this.buck.getResultFilterAggregationBucket(res),
                            filter_hits: this.buck.getResultFilterHitsBucket(res),
                            type_bucket: this.aggs.params.type_bucket,
                            nom_champ: this.aggs.params.nom_champ,
                            typeDateFiltre: this.aggs.params.typeDateFiltre,
                            chartLabels: this.aggs.params.chartLabels,
                            query: this.aggs.aggreg,
                            typeOfaggregationSwtich: visState.aggregation.typeOfaggregationSwtich
                          };
                        this.filtreHitsChangeBucket(resultat);
                      }
                    );
                  } else {
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
    } catch (error) {
      this.pnotify.error({
        text: error
      });
    }
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
  indexChangeFiltreMetrics(resultat: any) {
    // Ici on recupere juste les objets de type Array Array qui contient nos resultats
    // if (resultatFiltre['metricsAggregationRangeDate']) {
    //   this.resultatFiltreWithAggregation = resultatFiltre;
    //   this.aggregation = this.resultatFiltreWithAggregation['aggregation'];
    //   this.name_field_aggrega_for_result = 'agg_' + this.aggregation.type + '_' + this.aggregation.params.field;
    // }
    if (resultat['metricsAggregationRangeDate'] === true) {
      this.resultatFiltreWithAggregation = resultat;
      this.aggregation = this.resultatFiltreWithAggregation['aggregation'];
      this.name_field_aggrega_for_result = 'agg_' + this.aggregation.type + '_' + this.aggregation.params.field;
    } else {
      if (resultat instanceof Array) {
        resultat.forEach(res =>  this.resultatAggregationMetrics.push(
          {
            objectResult: res,
            id: this.resultatAggregationMetrics.length + 1
          }
        ));
      }
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
    try {
      if (this.currentChart) {
        this.currentChart.clear();
        this.currentChart.destroy();
      }
    } catch (error) {
      this.pnotify.error({
        text: error
      });
    }
    try {
      this.loading = true;
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
          this.resultatMetrics();
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
            }
            this.currentChart = this.chartService.tracerChart(
              this.nomDiagramme, 'myChart', this.chartData, this.chartLabels, this.options
            );
          }
        }
        this.resultatAllForBucket = resultat;
      }
      this.loading = false;
    } catch (error) {
      this.pnotify.error({
        text: error
      });
    }
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
      this.params.chartLabels = this.chartLabels;

      const visState = {
        name_type_chart: this.nomDiagramme,
        type: type,
        index: this.nomIndex,
        aggregation: {
          aggreg: this.resultatAllForBucket['query'],
          typeOfaggregationSwtich: this.resultatAllForBucket['typeOfaggregationSwtich'],
          params: this.params
        }
      };
      this.objectVisualizationSave.type = Config.NAME_FIELD_OF_MAPPING.VISUALIZATION;
      this.objectVisualizationSave.updated_at = new Date();
      this.objectVisualizationSave.visualization.visState = JSON.stringify(visState);
      this.objectVisualizationSave.visualization.uiStateJSON = '';

      // permet de recupérer l'id au niveau du URL
      let idForModif = null;
      this.route.queryParamMap.subscribe(async params => {
        idForModif = params.get('idVisualisation') ? params.get('idVisualisation') : null;
      });
      if (idForModif !== null) {
        this.es.updateDoc(Config.INDEX.NOM_INDEX_FOR_MAPPING, Config.INDEX.TYPE, idForModif, this.objectVisualizationSave);
      } else {
        this.es.createDoc(Config.INDEX.NOM_INDEX_FOR_MAPPING, Config.INDEX.TYPE, this.objectVisualizationSave);
      }
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
      this.objectVisualizationSave.updated_at = new Date();
      this.objectVisualizationSave.visualization.visState = JSON.stringify(visState);
      this.objectVisualizationSave.visualization.uiStateJSON = '';
      // permet de recupérer l'id au niveau du URL
      let idForModif = null;
      this.route.queryParamMap.subscribe(async params => {
        idForModif = params.get('idVisualisation') ? params.get('idVisualisation') : null;
      });
      if (idForModif !== null) {
        this.es.updateDoc(Config.INDEX.NOM_INDEX_FOR_MAPPING, Config.INDEX.TYPE, idForModif, this.objectVisualizationSave);
      } else {
        this.es.createDoc(Config.INDEX.NOM_INDEX_FOR_MAPPING, Config.INDEX.TYPE, this.objectVisualizationSave);
      }
    }
  }
  selectShowLabelChart() {
    this.params.showLabel = !this.params.showLabel;
    this.currentChart.options.title.display = this.params.showLabel;
    this.currentChart.update({
      duration: 300,
      easing: 'easeOutBounce'
    });
  }
  selectShowFeelChart() {
    this.params.fill = !this.params.fill;
    this.filtreHitsChangeBucket(this.resultatAllForBucket);
    this.currentChart.update({
      duration: 300,
      easing: 'easeOutBounce'
    });
  }
  selectShowLegendChart() {
    this.params.showLegend = !this.params.showLegend;
    this.currentChart.options.legend.display = this.params.showLegend;
    this.currentChart.update({
      duration: 300,
      easing: 'easeOutBounce'
    });
  }
  loadLabelChart() {
    if (this.params.nomLabel) {
      this.currentChart.options.title.text = this.params.nomLabel;
      this.params.nomLabel = '';
      this.currentChart.update({
        duration: 300,
        easing: 'easeOutBounce'
      });
    }
  }
  changePositionLegend(event: any) {
    this.params.positionLegend = event.target.value;
    if (this.params.positionLegend) {
      this.currentChart.options.legend.position = this.params.positionLegend;
      this.currentChart.update({
      duration: 200,
      easing: 'easeOutBounce'
    });
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
