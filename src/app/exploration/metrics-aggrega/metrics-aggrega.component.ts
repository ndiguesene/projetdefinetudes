import { Config } from './../../config/Config';
import { PnotifyService } from './../../services/pnotify.service';
import { MetricsService } from './../../services/metrics.service';
import { AggregationData } from './../../entities/aggregationData';
import { Component, OnInit, Input , EventEmitter, Output} from '@angular/core';
import { ElasticsearchService } from '../../services/elasticsearch.service';
import * as bodybuilder from 'bodybuilder';
import { BucketsService } from '../../services/buckets.service';

@Component({
  selector: 'app-metrics-aggrega',
  templateUrl: './metrics-aggrega.component.html',
  styleUrls: ['./metrics-aggrega.component.css']
})
export class MetricsAggregaComponent implements OnInit {
  @Output()
  change: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  changeRemoveComposant: EventEmitter<number> = new EventEmitter<number>();
  resultatFiltre: Promise<any>;

  @Input()
  index: string;
  @Input()
  idComposant: number;
  @Input()
  hiddenButRemove: boolean;

  listFieldString: string[];
  listFieldNumber: string[];
  listFieldDate: string[];
  listFieldStringAll: string[];
  listAllFieldWithType = [];

  typeDateFiltre: string;

  typeChampSelected = '';

  listeIndex: Promise<any>;
  selectFieldAggregation = false;
  fieldBucketsChoiceDate: string;

  /**
   * Ce champ permet de déterminer quel champ a été choisit pour le filtre metrics
   * (avg, sum, min, max ... sauf le count)
   */
  fieldMetricsChoice = '';
  typeOfaggregationSwtich = '';

  listeOperationsMetrics = this.metricsAgg.listeOperationsMetrics;
  listeBuckets = this.buck.listeBuckets;

  pnotify = this.ps.getPNotify();
  // pour la séléction du filtre
  valueFieldForFilter = '';
  nomFieldForFilter = '';
  typeFiltreForFilter = '';

  listFieldValueStringAll: string[];
  listFieldAllNotFilter = [];

  editByQueryDSL = true;
  listeFiltre = [
    {id: 'is', value: 'term'},
    {id: 'is not', value: ''},
    {id: 'exist', value: ''},
    {id: 'not exist', value: ''}
  ];
  /**
   * Ce champ permet de filtrer la liste des champ qui va etre afficher
   * soit de type number(integer, float, long ...), string, text
   */
  constructor(private es: ElasticsearchService,
              private metricsAgg: MetricsService,
              private buck: BucketsService,
              private ps: PnotifyService) { }

  async ngOnInit() {
    await this.loadListFieldOnView(this.index);
  }
  selectFieldMetricsChoice(event: any) {
    if (event) {
      this.fieldMetricsChoice = event.target.value;
    }
  }
  selectTypeOfAggregationSwtich(event: any) {
    if (event) {
      this.typeOfaggregationSwtich = event.target.value;
      // if (this.typeOfaggregationSwtich === 'count') {
      //   this.selectFieldForAggregationAndBucket = false;
      // } else {
      //   this.selectFieldForAggregationAndBucket = true;
      // }
    }
  }
  async getNomFieldForFilter(event: any) {
    // this.es.count(this.index, _query).then(
    //   re => console.log(re)
    // );
    if (this.nomFieldForFilter) {
      const _query = await bodybuilder()
          .aggregation('terms', this.nomFieldForFilter + '.keyword', {
            size: Config.SIZE_MAX_RESULT_QUERY_RETURN
          }).size(0).build();
      await this.es.getSearchWithAgg(this.index, _query).then(
        async res => {
          this.listFieldValueStringAll = await this.buck.getResultFilterAggregationBucket(res);
        }
      );
      this.listFieldValueStringAll = await this.listFieldValueStringAll.map(r => r['key']);
    }
    // if (this.nomFieldForFilter) {
    //   let nomType;
    //   let count = 0;
    //   // await this.es.getNameType(this.index).then(async res => nomType = await res);
    //   const _query = await bodybuilder().aggregation('terms', this.nomFieldForFilter)
    //   .build();
    //   this.es.count(this.index, _query).then(
    //     re => console.log(re)
    //   );
    //   this.es.getSearchWithAgg(this.index, _query).then(
    //     res => console.log(res)
    //   );
    // this.valueFieldForFilter = event.target.value;
    // }
  }
  async loadListFieldOnView(index: string) {
    try {
      let type;
      // this.loading = false;
      /**
       * On applique un 'await' a l'instruction pour demander au programme de ne poursuivre
       * que si l'exécution est terminée
       */
      await this.es.getNameType(index).then(re => type = re);
      await this.es.getAllFieldsByIndexService(index, type).then(
        res => {
          // this.extractAllFieldJSON(this.listFieldString);
          this.listFieldStringAll = res[index].mappings;
          /**
           * On recupere la liste des types des champs
           */
          this.es.getIndexNumFields(index).then(
            respp => this.listFieldNumber = respp
          );
          this.es.getIndexDateFields(index).then(
            resp => this.listFieldDate = resp
          );
          this.es.getIndexTextFields(index).then(
            re => this.listFieldString = re
          );
          /**
           * Cette instruction en bas permet de recupérer la liste des clé de l'objets
           * qui constituer la liste de mes champs de l'index choisi
           */
          this.listFieldStringAll = Object.keys(this.listFieldStringAll[type]);
          this.listFieldAllNotFilter = this.listFieldStringAll;
          // Ici on applique un filtre pour ne sélectionner que les champs qui nous intéressent
          // en enlevant les champs commencant par '_' et terminant par .keyword
          this.listFieldStringAll = this.listFieldStringAll.filter(
            el => (!el.startsWith('_')) && (!el.endsWith('.keyword')
            && (el !== '_index') && (el !== '_type') && (el !== '_id'))
          ).sort();
          // this.loading = true;
        }
      );
      this.listFieldAllNotFilter.map(
        (re, inc) => { this.listFieldAllNotFilter.push({id: inc, name: re}); }
      );
    // this.contentArray = this.listFieldStringAll.map(
    //   (field: string, i: number) => field
    // );
    // this.returnedArray = this.contentArray.slice(0, this.nombreItemShowForPaggination);
      await this.listFieldString.map(async str => {
        await this.listAllFieldWithType.push(
            {id: 'string', nameType: str}
          );
        }
      );
      await this.listFieldNumber.map(async str => {
        await this.listAllFieldWithType.push(
            {id: 'number', nameType: str}
          );
        }
      );
      await this.listFieldDate.map(async str => {
        await this.listAllFieldWithType.push(
            {id: 'date', nameType: str}
          );
        }
      );
      console.log(this.listAllFieldWithType);
    } catch (error) {
      this.pnotify.error({
        text: error
      });
    }
  }
  removeFilterForMetric(id) {

  }
  resultatAggregat(typeOfaggregationSwtich: string) {
    try {
      if (this.fieldMetricsChoice === '') {
        this.fieldMetricsChoice = this.listFieldNumber[0];
      }
      if (this.selectFieldAggregation) {
        let _query;
        if (this.valueFieldForFilter) {
          _query = bodybuilder()
          .filter('term', this.nomFieldForFilter + '.keyword', this.valueFieldForFilter)
          .aggregation('date_histogram', this.fieldBucketsChoiceDate, {
            format: 'yyyy-MM-dd',
            interval: this.typeDateFiltre
          }, (a) => {
            return a.aggregation(typeOfaggregationSwtich, this.fieldMetricsChoice);
          }).build();
        } else {
          _query = bodybuilder()
          .aggregation('date_histogram', this.fieldBucketsChoiceDate, {
            format: 'yyyy-MM-dd',
            interval: this.typeDateFiltre
          }, (a) => {
            return a.aggregation(typeOfaggregationSwtich, this.fieldMetricsChoice);
          }).build();
        }

        const agg = new AggregationData();
        agg.type = typeOfaggregationSwtich;
        agg.enabled = true;
        agg.schema = 'metric';
        agg.id = '';
        agg.params = {
          field: this.fieldMetricsChoice,
          query: _query,
          typeDateFiltre: this.typeDateFiltre,
          fieldBucketsChoiceDate: this.fieldBucketsChoiceDate
        };
        this.es.getSearchWithAgg(this.index, _query).then(
          res => {
            this.resultatFiltre = this.buck.getResultFilterAggregationBucket(res);
            this.change.emit({
              result: this.resultatFiltre,
              aggregation: agg,
              size: res.hits.total,
              metricsAggregationRangeDate: true
            });
          }
        );
      } else {
        if (typeOfaggregationSwtich === 'count') {
          let _query;
          if (this.valueFieldForFilter) {
            _query = bodybuilder()
            .filter('term', this.nomFieldForFilter + '.keyword', this.valueFieldForFilter)
            .query('match_all')
            .build();
          } else {
            _query = bodybuilder()
            .query('match_all')
            .build();
          }

            const agg = new AggregationData();
            agg.type = typeOfaggregationSwtich;
            agg.enabled = true;
            agg.schema = 'metric';
            agg.id = '';
            agg.params = {
              field: null,
              query: _query,
              typeDateFiltre: null,
              fieldBucketsChoiceDate: null
            };

            this.es.getSearchWithAgg(this.index, _query).then(
              res => {
                this.resultatFiltre = this.metricsAgg._getAggResult(res, agg);
                this.change.emit(this.resultatFiltre);
              }
            );
        } else {
          let _query;
          if (this.valueFieldForFilter) {
            _query = bodybuilder()
            .filter('term', this.nomFieldForFilter + '.keyword', this.valueFieldForFilter)
            .aggregation(
              typeOfaggregationSwtich, this.fieldMetricsChoice
            ).build();
          } else {
            _query = bodybuilder()
            .aggregation(
              typeOfaggregationSwtich, this.fieldMetricsChoice
            ).build();
          }

          const agg = new AggregationData();
          agg.type = typeOfaggregationSwtich;
          agg.enabled = true;
          agg.schema = 'metric';
          agg.id = '';
          agg.params = {
            field: this.fieldMetricsChoice,
            query: _query
          };
          this.es.getSearchWithAgg(this.index, _query).then(
            res => {
              this.resultatFiltre = this.metricsAgg._getAggResult(res, agg);
              this.change.emit(this.resultatFiltre);
            }
          );
        }
      }
    } catch (error) {
      this.pnotify.error({
        text: error
      });
    }
  }
  // ajoutNewMetricsAggregat() {
  //   alert('AJout');
  // }
  selectFieldBucketsChoiceDate(event: any) {
    if (event) {
      this.fieldBucketsChoiceDate = event.target.value;
    }
  }
  removeMetricsAggregat() {
    this.changeRemoveComposant.emit(this.idComposant);
  }
  selectAppliedFieldAggregation() {
    this.selectFieldAggregation = !this.selectFieldAggregation;
  }
  selectTypeDateFiltre(event: any) {
    if (event) {
      this.typeDateFiltre = event.target.value;
    }
  }

}
