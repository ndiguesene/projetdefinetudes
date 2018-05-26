import { MetricsService } from './../../services/metrics.service';
import { BucketsService } from './../../services/buckets.service';
import { AggregationData } from './../../entities/aggregationData';
import { ElasticsearchService } from './../../services/elasticsearch.service';
import { Component, OnInit, Input , EventEmitter, Output } from '@angular/core';
import * as bodybuilder from 'bodybuilder';
import { DatePipe } from '@angular/common';
import { BsDaterangepickerConfig } from 'ngx-bootstrap';
import { formatDate } from 'ngx-bootstrap/chronos';

@Component({
  selector: 'app-buckets-aggrega',
  templateUrl: './buckets-aggrega.component.html',
  styleUrls: ['./buckets-aggrega.component.css']
})
export class BucketsAggregaComponent implements OnInit {
  @Input()
  index: string;
  @Input()
  idComposant: number;
  @Input()
  hiddenButRemove: boolean;

  @Output()
  changeResultFiltre: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  changeRemoveComponent: EventEmitter<any> = new EventEmitter<any>();

  listeOperationsMetrics = this.metr.listeOperationsMetrics;
  listeBuckets = this.buck.listeBuckets;

  typeOfaggregationSwtich = '';

  searchByDateHistogrammeRange = false;
  searchByDateHistogrammeAggregation = false;
  searchByRange = false;
  searchByHostogram = false;

  listFieldString: string[];
  listFieldDate: string[];
  listFieldNumber: string[];
  listFieldStringAll: string[];

  fieldBucketsChoice: string;
  fieldBucketsChoiceForFilter: string;
  typeDateFiltre: string; // year, month ou day
  nameBucket: string;

  rangeValeurDe = 0;
  rangeValeurA = 0;
  // rangeDateDe = '';
  // rangeDateA = '';
  rangeDate = [];

  constructor(private es: ElasticsearchService,
              private buck: BucketsService,
              private metr: MetricsService) {}


  async ngOnInit() {
    await this.loadListFieldOnView(this.index);
  }
  async loadListFieldOnView(index: string) {
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
         * Cette instruction en bas permet de recupérer la liste des clé de l'objets
         * qui constituer la liste de mes champs de l'index choisi
         */
        this.listFieldStringAll = Object.keys(this.listFieldStringAll[type]);
        // Ici on applique un filtre pour ne sélectionner que les champs qui nous intéressent
        // en enlevant les champs commencant par '_' et terminant par .keyword
        this.listFieldStringAll = this.listFieldStringAll.filter(
          el => (!el.startsWith('_')) && (!el.endsWith('.keyword')
          && (el !== '_index') && (el !== '_type') && (el !== '_id'))
        ).sort();

        this.es.getIndexTextFields(index).then(
          // tslint:disable-next-line:no-shadowed-variable
          res => this.listFieldString = res
        );
        /**
         * On recupere la liste des types des champs
         */
        this.es.getIndexNumFields(index).then(
          respp => this.listFieldNumber = respp
        );
        this.es.getIndexDateFields(index).then(
          resp => this.listFieldDate = resp
        );
        // this.loading = true;
      }
    );
    // this.contentArray = this.listFieldStringAll.map(
    //   (field: string, i: number) => field
    // );
    // this.returnedArray = this.contentArray.slice(0, this.nombreItemShowForPaggination);
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
  selectBucket(event: any) {
    this.nameBucket = event.target.value;
    if (this.nameBucket === 'range_aggregation') {
      this.searchByRange = true;
      this.searchByDateHistogrammeRange = false;
      this.searchByDateHistogrammeAggregation = false;
      this.searchByHostogram = false;
    } else if (this.nameBucket === 'date_range') {
      this.searchByRange = false;
      this.searchByDateHistogrammeRange = true;
      this.searchByDateHistogrammeAggregation = false;
      this.searchByHostogram = false;
    } else if (this.nameBucket === 'date_histogram') {
      this.searchByRange = false;
      this.searchByDateHistogrammeRange = false;
      this.searchByDateHistogrammeAggregation = true;
      this.searchByHostogram = false;
    } else if (this.nameBucket === 'histogram') {
      this.searchByRange = false;
      this.searchByDateHistogrammeRange = false;
      this.searchByDateHistogrammeAggregation = false;
      this.searchByHostogram = true;
    }
  }
  async resultatAggregat(typeOfaggregationSwtich: string, nameBucket: string) {
    const agg = new AggregationData();
    agg.type = typeOfaggregationSwtich;
    agg.enabled = true;
    agg.schema = 'metric';
    agg.id = '';
    agg.params = {
      field: this.fieldBucketsChoice
    };
    if (this.fieldBucketsChoice === '') {
      this.fieldBucketsChoice = this.listFieldNumber[0];
    }
    // bodybuilder().aggregation('date_range', 'date', {
    //   format: 'MM-yyy',
    //   ranges: [{ to: 'now-10M/M' }, { from: 'now-10M/M' }]
    // }).build();

    // const _query = bodybuilder().aggregation(
    //   typeOfaggregationSwtich, this.fieldBucketsChoice
    // ).build();
    // const _query = bodybuilder().query(
    //   nameBucket, this.fieldBucketsChoice, {gt: 5}
    // ).build();

    // const _query = bodybuilder().aggregation('range', this.fieldBucketsChoice, {
    //   // format: 'MM-yyy',
    //   ranges: [{ to: 50 }, { from: 100 }]
    // }).build(); ici c'est pour donner le nombre exact que retourne la requete(le doc_count)
    if (this.nameBucket === 'range_aggregation') {
      if (this.typeOfaggregationSwtich === 'null' || this.typeOfaggregationSwtich === '' || this.typeOfaggregationSwtich === null) {
        /**
         * Ici c'est au cas ou il n'applique pas d'aggrégation metrics(max,min,avg...)
         */
        let _query;
        _query = bodybuilder()
          .filter('range', this.fieldBucketsChoice,
            {'gte': this.rangeValeurDe, 'lte': this.rangeValeurA }
          ).build();

          await this.es.getSearchWithAgg(this.index, _query).then(
            res => {
              this.changeResultFiltre.emit({
                ...{
                  filter_aggregation: 'Pas d\'aggrégations appliquées.',
                  filter_hits: this.buck.getResultFilterHitsBucket(res),
                  type_bucket: this.nameBucket,
                  nom_champ: this.fieldBucketsChoice,
                  query: _query
                }
              });
            }
          );
      } else {
        /**
         * Ici c'est dans le cas ou il applique une aggrégation dans le range donné
         */
        let _query;
        _query = bodybuilder()
          .filter('range', this.fieldBucketsChoice,
              {'gte': this.rangeValeurDe, 'lte': this.rangeValeurA}
            )
          .aggregation(typeOfaggregationSwtich, this.fieldBucketsChoice)
          .sort(this.fieldBucketsChoice, 'asc')
          .build();
          await this.es.getSearchWithAgg(this.index, _query).then(
            res => {
              this.changeResultFiltre.emit({
                ...{
                  filter_aggregation: this.buck.getResultFilterAggregationBucket(res),
                  filter_hits: this.buck.getResultFilterHitsBucket(res),
                  type_bucket: this.nameBucket,
                  nom_champ: this.fieldBucketsChoice,
                  query: _query
                }
              });
            }
          );
      }
    } else if (this.nameBucket === 'date_histogram') {
      /**
       * Dans la variable 'resultFilterDateHistogram' j'enregistre tous les résultats que fera l'utilisateur
       */
      const _query = bodybuilder()
            .aggregation('date_histogram', this.fieldBucketsChoice, {
              format: 'yyyy-MM-dd',
              interval: this.typeDateFiltre
            }).build();
      await this.buck.queryDateHistoGrammAggregation(
        this.index, _query).then(
          resp => {
            /**
             * J'envoi ici la un objet au lieu de la référence de l'objet en
             * utilisant {... nom_objet}
             */
            this.changeResultFiltre.emit({
                ...{
                  filter_aggregation: this.buck.getResultFilterAggregationBucket(resp),
                  filter_hits: this.buck.getResultFilterHitsBucket(resp),
                  type_bucket: this.nameBucket,
                  nom_champ: this.fieldBucketsChoice,
                  typeDateFiltre: this.typeDateFiltre,
                  query: _query
                }
              });
          }
      );
    } else if (this.nameBucket === 'date_range') {
      let _query;
      if ((this.typeOfaggregationSwtich !== null) &&
        (this.typeOfaggregationSwtich !== undefined) &&
        (this.typeOfaggregationSwtich !== '') && (this.typeOfaggregationSwtich)) {
        _query = bodybuilder()
            .aggregation('date_range', this.fieldBucketsChoice, {
              format: 'yyyy-MM-dd',
              ranges: { from: this.rangeDate[0], to: this.rangeDate[1] },
            // tslint:disable-next-line:no-shadowed-variable
            }, agg => agg.aggregation(typeOfaggregationSwtich, this.fieldBucketsChoiceForFilter))
          .build();
        await this.buck.queryDateRangeAggregation(this.index, _query).then(
          resp => {
            this.changeResultFiltre.emit({
              ...{
                filter_aggregation: this.buck.getResultFilterAggregationBucket(resp),
                filter_hits: this.buck.getResultFilterHitsBucket(resp),
                type_bucket: this.nameBucket,
                nom_champ: this.fieldBucketsChoice,
                query: _query,
                range: this.rangeDate,
                fieldBucketsChoiceForFilter: this.fieldBucketsChoiceForFilter,
                typeOfaggregationSwtich: this.typeOfaggregationSwtich
              }
            });
          }
        );
      } else {
        if ((this.fieldBucketsChoiceForFilter !== null) &&
        (this.fieldBucketsChoiceForFilter !== undefined) &&
        (this.fieldBucketsChoiceForFilter !== '') && (this.fieldBucketsChoiceForFilter)) {
          _query = bodybuilder()
          // rawOption permet d'afficher juste les champs spécifiés
          .rawOption('_source', [this.fieldBucketsChoiceForFilter, this.fieldBucketsChoice])
          .aggregation('date_range', this.fieldBucketsChoice, {
            format: 'yyyy-MM-dd',
            ranges: { from: this.rangeDate[0], to: this.rangeDate[1] }
          }).build();
        } else {
          _query = bodybuilder()
            .aggregation('date_range', this.fieldBucketsChoice, {
              format: 'yyyy-MM-dd',
              ranges: { from: this.rangeDate[0], to: this.rangeDate[1] }
            }).build();
        }
        await this.buck.queryDateRangeAggregation(this.index, _query).then(
          resp => {
            this.changeResultFiltre.emit({
              ...{
                filter_aggregation: this.buck.getResultFilterAggregationBucket(resp),
                filter_hits: this.buck.getResultFilterHitsBucket(resp),
                type_bucket: this.nameBucket,
                query: _query,
                nom_champ: this.fieldBucketsChoice,
                range: this.rangeDate,
                fieldBucketsChoiceForFilter: this.fieldBucketsChoiceForFilter,
                typeDateFiltre: this.typeDateFiltre
              }
            });
          }
        );
      }
    } else if (this.nameBucket === 'histogram') {
      let _query;
        _query = bodybuilder()
        .aggregation('histogram', this.fieldBucketsChoice, {
            'field': this.fieldBucketsChoice,
            'interval': 20
          }).sort(this.fieldBucketsChoice, 'asc')
          .build();

          await this.es.getSearchWithAgg(this.index, _query).then(
            res => {
              this.changeResultFiltre.emit({
                ...{
                  filter_aggregation: this.buck.getResultFilterAggregationBucket(res),
                  filter_hits: this.buck.getResultFilterHitsBucket(res),
                  type_bucket: this.nameBucket,
                  nom_champ: this.fieldBucketsChoice,
                  query: _query
                }
              });
            }
          );
    }
  }
  dateChangeFormated(date: any) {
    this.rangeDate = [];
    date.map(res => {
      let t;
      t = new Intl.DateTimeFormat('en-GB').format(res).toString();
      t = t.replace(new RegExp('/', 'g'), '-');
      /**
       * Au cas ou le séparateur n'est pas '/' mais plutot que '-'
       */
      if (t.length === 0) {
        t = t.replace(new RegExp('-', 'g'), '/');
      }
      console.log(t);
      // de ce format dd/MM/YYYY à ce format yyyy-MM-dd
      const tab = t.split('-');
      this.rangeDate.push(tab[2] + '-' + tab[1] + '-' + tab[0]);
    });
    console.log(this.rangeDate);
  }
  selectTypeDateFiltre(event: any) {
    if (event) {
      this.typeDateFiltre = event.target.value;
    }
  }
  selectFieldBucketsChoice(event: any) {
    if (event) {
      this.fieldBucketsChoice = event.target.value;
    }
  }
  selectFieldBucketsChoiceForFilter(event: any) {
    if (event) {
      this.fieldBucketsChoiceForFilter = event.target.value;
    }
  }
  removeBucketAggregat() {
    this.changeRemoveComponent.emit(this.idComposant);
  }

}
