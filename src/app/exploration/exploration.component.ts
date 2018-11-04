import { PnotifyService } from './../services/pnotify.service';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { MetricsService } from './../services/metrics.service';
import { AggregationData } from './../entities/aggregationData';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElasticsearchService } from '../services/elasticsearch.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-exploration',
  templateUrl: './exploration.component.html',
  styleUrls: ['./exploration.component.css']
})
export class ExplorationComponent implements OnInit, OnDestroy {
  /**
   * Cette variable indexParDefaut permet de recupérer l'index par defaut
   * choisit par l'utilisateur a partir de la base
   */
  indexParDefaut = this.es.getDefaultIndexService();
  /**
   * Cette variable listFieldString contiendra la liste des champs d'un index
   * qu'on va charger(sélectionner)
   */
  /**
   * Ces variables vont recupérer la liste des champ en fonciton de leur type
   */
  listFieldString: string[];
  listFieldNumber: string[];
  listFieldDate: string[];
  listFieldStringAll: string[];

  listFieldStringType: string[];
  listeChampForFilter: string[];
  /**
   * Cette variable va contenir la liste des éléments
   */
  listDataInIndex: Promise<any>[];
  listeIndex: Promise<any>;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();

  resultatFiltre = [];
  resultatFiltreWithAggregation: any;
  component: any;

  showResultsHits = false;
  /**
   * Cette permet de définir le nombre de champs qui sera affiché par défaut
   */
  nombreItemShowForPaggination = 10;

  // Pour la partie selection multiple
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {
    singleSelection: false,
    placeholder: 'champs',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };
  /**
   * Cette variable contiendra la liste des champs qui sera affichée
   */
  contentArray: string[];
  returnedArray: string[];

  loading = false;
  loadingSearch = false;

  selectFieldForAggregationAndBucket = false;

  choiceListeField = true;
  choiceFieldMetricsAndBuckets = false;
  /**
   * Ce champ permet de filtrer la liste des champ qui va etre afficher
   * soit de type number(integer, float, long ...), string, text
   */
  typeChampSelected = '';
  /**
   * Ce champ permet de déterminer quel champ a été choisit pour le filtre metrics
   * (avg, sum, min, max ... sauf le count)
   */
  fieldMetricsChoice = '';
  typeOfaggregationSwtich = '';

  typeDeFiltre: string;

  listeMetrics = [];
  listeBucketsAggrega = [];

  /**
   * La liste des variable en bas vont contenir les resultats des filtres en fonction
   * du bucket choisit dans le menu déroulante
   */
  resultFilterDateHistogram = [];
  resultFilterDateHistogramShowInHtml = [];
  resultFilterRangeAggregration = [];

  // private _subscriptions: Subscription;
  countLineResultByAggregation = [];

  aggregation: AggregationData;
  name_field_aggrega_for_result: string;
  masquerresultatFiltreWithAggregation = true;
  /*
  cette variable va permettre d'afficher la liste des elements en fonction d'un nombre bien définit
  */
  showList = [];
  pnotify = this.ps.getPNotify();

  constructor(private es: ElasticsearchService, private metricsAgg: MetricsService,
      protected localStorage: LocalStorage,
      private ps: PnotifyService) {
    // this.maxDate.setDate(this.maxDate.getDate() + 7);
    // this.bsRangeValue = [this.bsValue, this.maxDate];
  }
  OnItemDeSelect(item: string) {
    this.listeChampForFilter = this.listeChampForFilter.filter(
        e => e !== item
      );
  }
  onDeSelectAll(items: string) {
    this.listeChampForFilter = [];
  }
  onItemSelect(item: string) {
    this.listeChampForFilter.push(item);
  }
  onSelectAll(items: string) {
    this.listeChampForFilter = items.toString().split(',');
  }
  selectFieldForFilter() {
    // console.log(this.listeChampForFilter);
  }
  async ngOnInit() {
    try {
      this.getAllIndex();
      this.es.getDefaultIndexService().then(p => {
        this.indexParDefaut = p['hits']["hits"][0]._source.config.defaultIndex;
        this.displayFieldAndLoadData(null, this.indexParDefaut);
      });
      // permet de recupérer le contenu du variable stocké dans une variable de stockage qu niveau du navigateur
       /* if (!!localStorage.getItem('resultatFiltre')) {
         await this.localStorage.getItem('resultatFiltre').subscribe(async res => {
           this.resultatFiltre = await JSON.parse(res);
         });
       }
       if (!!localStorage.getItem('resultFilterDateHistogramShowInHtml')) {
         await this.localStorage.getItem('resultFilterDateHistogramShowInHtml').subscribe(async res => {
           this.resultFilterDateHistogramShowInHtml = await JSON.parse(res);
         });
       }
       if (!!localStorage.getItem('listeMetrics')) {
         await this.localStorage.getItem('listeMetrics').subscribe(async res => {
           this.listeMetrics = await JSON.parse(res);
         });
       }
       if (!!localStorage.getItem('listeBucketsAggrega')) {
         await this.localStorage.getItem('listeBucketsAggrega').subscribe(async res => {
           this.listeBucketsAggrega = await JSON.parse(res);
         });
       }
       if (!!localStorage.getItem) {
          if (!!localStorage.getItem('indexParDefaut')) {
            await this.localStorage.getItem('indexParDefaut').subscribe(async res => {
              this.listeBucketsAggrega = await JSON.parse(res);
            });
          } else {
            // alert('indexpardefaut non');
          }
        } */
      /**
       *  await permet de d'attendre jusqu'à la fin de l'instruction indiqué pour contiuner
       *  les instructions
       **/
      await this.loadListFieldOnView(this.indexParDefaut);
      this.getAllDocuments(this.indexParDefaut);
    } catch (error) {
      // this.pnotify.error({
      //   text: error
      // });
    }
  }
  // selectBucket(event: any) {
  //   const nameBucket = event.target.value;
  //   if (nameBucket === 'range') {
  //     this.searchByRange = true;
  //     this.searchByDateHistogramme = false;
  //   } else if (nameBucket === 'histogramme') {
  //     this.searchByRange = false;
  //     this.searchByDateHistogramme = true;
  //   } else {
  //     this.searchByRange = false;
  //     this.searchByDateHistogramme = false;
  //   }
  // }
  selectFieldMetricsChoice(event: any) {
    if (event) {
      this.fieldMetricsChoice = event.target.value;
    }
  }
  selectTypeOfAggregationSwtich(event: any) {
    if (event) {
      this.typeOfaggregationSwtich = event.target.value;
      if (this.typeOfaggregationSwtich === 'count') {
        this.selectFieldForAggregationAndBucket = false;
      } else {
        this.selectFieldForAggregationAndBucket = true;
      }
    }
  }
  ajouterNewAggregation() {
    if (this.typeDeFiltre) {
      if (this.typeDeFiltre === 'metrics') {
        this.listeMetrics.push({
          index: this.indexParDefaut,
          id: this.listeMetrics.length + 1
        });
      } else if (this.typeDeFiltre === 'buckets') {
        this.listeBucketsAggrega.push({
          index: this.indexParDefaut,
          id: this.listeBucketsAggrega.length + 1
        });
      }
       this.localStorage.setItem('listeBucketsAggrega', JSON.stringify(this.listeBucketsAggrega))
         .subscribe(() => {});
       this.localStorage.setItem('listeMetrics', JSON.stringify(this.listeMetrics))
         .subscribe(() => {});
    }
  }
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.returnedArray = this.contentArray.slice(startItem, endItem);
  }
  selectFieldMetricsAndBuckets(event: any) {
    this.typeDeFiltre = event.target.value;
  }
  ngOnDestroy() {
    // for(const i=0; i<this._subscriptions.length; i++){
    // 	// prevent memory leak when component destroyed
    // 	this._subscriptions[i].unsubscribe();
    // }
    // alert(typeof this.component);
  }
  async getAllDocuments(_index) {
    try {
      let type;
      this.loading = true;
      await this.es.getNameType(_index).then(re => type = re);
      await this.es.getAllDocumentsService(_index, type).then(
        res => {
          this.listDataInIndex = res.hits.hits;
          /**
           * On essai d'acceder au champ _source pour recupérer la liste des objets
           */
          this.listDataInIndex = this.listDataInIndex.map(
            ele => this.listDataInIndex = ele['_source']
          );
          this.loading = false;
        }
      );
    } catch (error) {
      // this.pnotify.error({
      //   text: error
      // });
    }
  }
  async getAllIndex() {
    await this.es.getAllIndexService().then(
      resp => {
        this.listeIndex = resp;
      }
    );
  }
  showResult(event: any) {
    const nombreElement = event.target.value;
    this.showList = [];
    for (let i = 0; i < nombreElement; i++) {
      this.showList[i] = this.resultFilterDateHistogramShowInHtml['dataAggregation'][i];
    }
  }
  async displayFieldAndLoadData(event: any, index?) {
    // tslint:disable-next-line:no-shadowed-variable
    let element = "";
    if (index) {
      element = index;
    } else {
      element = event.target.value;
    }
    if (element !== 'Nom index') {
      this.indexParDefaut = element;
      await this.loadListFieldOnView(this.indexParDefaut);
      this.getAllDocuments(this.indexParDefaut);
    }
    // supprimer la liste des bucket et metrics ajoutée
    this.listeBucketsAggrega = [];
    this.listeMetrics = [];
    this.localStorage.setItem('indexParDefaut', JSON.stringify(this.indexParDefaut))
        .subscribe(() => {});
  }
  // debut evenement pour recevoir les données du composant enfant metrics
  /**
   * permet de recevoir l'évenement émit par le composant
   * Cette fonction communique avec le composant metricAggregaComponent comme parent
   * pour recupérer le resultat du filtre
   */
  indexChangeFiltreMetrics(resultatFiltre: any) {
    try {
      if (resultatFiltre) {
        if (resultatFiltre['metricsAggregationRangeDate']) {
          this.resultatFiltreWithAggregation = resultatFiltre;
          this.aggregation = this.resultatFiltreWithAggregation['aggregation'];
          this.name_field_aggrega_for_result = 'agg_' + this.aggregation.type + '_' + this.aggregation.params.field;
        } else {
          console.log(resultatFiltre);
          for (const ite of resultatFiltre) {
            this.resultatFiltre.unshift(
              {
                objectResult: ite,
                id: this.resultatFiltre.length + 1
              }
            );
          }
        }

        if (this.resultatFiltre.length !== 0) {
          this.localStorage.removeItemSubscribe('resultatFiltre');
          this.localStorage.setItem('resultatFiltre', JSON.stringify(this.resultatFiltre))
          .subscribe((r) => {});
        }
      }
    } catch (error) {
      // this.pnotify.error({
      //   text: error
      // });
    }
  }
  removeMetrics(id: number) {
    if (id) {
      this.resultatFiltre.map((el, incr) => {
        /**
         * Comparé si idComposant donné en parametre est le meme qu'un id dans le tableau
         * listeMetrics
         */
        if (id === el.id) {
          /**
           * Supprimer l'objet correspondant avec slice
           */
          this.resultatFiltre.splice(incr, 1);
        }
      });
      this.localStorage.setItem('resultatFiltre', JSON.stringify(this.resultatFiltre))
        .subscribe(() => {});
    }
  }
  recupererIdComposantChangeMetrics(idComposant: any) {
    if (idComposant) {
      this.listeMetrics.map((el, incr) => {
        /**
         * Comparé si idComposant donné en parametre est le meme qu'un id dans le tableau
         * listeMetrics
         */
        if (idComposant === el.id) {
          /**
           * Supprimer l'objet correspondant avec slice
           */
          this.listeMetrics.splice(incr, 1);
        }
      });
    }
  }
  // fin evenement pour recevoir les données du composant enfant metrics
  // Debut evenement pour recevoir les données du composant enfant buckets
  filtreHitsChangeBucket(resultat: any) {
    try {
      this.loading = true;
      if (this.resultFilterDateHistogram) {
        if (resultat['type_bucket'] === 'date_histogram' || resultat['type_bucket'] === 'histogram') {
          this.resultFilterDateHistogram.push({
            id: this.resultFilterDateHistogram.length + 1,
            dataAggregation: resultat['filter_aggregation'],
            data: resultat['filter_hits'],
            type_bucket: resultat['type_bucket'],
            nom_champ: resultat['nom_champ']
          });
          this.resultFilterDateHistogramShowInHtml = this.resultFilterDateHistogram[this.resultFilterDateHistogram.length - 1];
        } else {
          this.resultFilterDateHistogram.push({
            id: this.resultFilterDateHistogram.length + 1,
            data: resultat['filter_hits'],
            dataAggregation: resultat['filter_aggregation'],
            type_bucket: resultat['type_bucket'],
            nom_champ: resultat['fieldBucketsChoiceForFilter'],
            range : resultat['range'],
            aggregation: resultat['typeOfaggregationSwtich'] // pour date_range
          });
          this.resultFilterDateHistogramShowInHtml = this.resultFilterDateHistogram[this.resultFilterDateHistogram.length - 1];
        }
        if (!this.resultFilterDateHistogramShowInHtml['dataAggregation'].value) {
          this.countLineResultByAggregation = [];
          // 200 est la valeur limite des résultats qui pourront etre afficher
          if (this.resultFilterDateHistogramShowInHtml['dataAggregation'].length >= 300) {
            let j = 0;
            for (let i = 0; i < 300; i++) {
              if (i % 5 === 0) {
                this.countLineResultByAggregation[j] = i;
                j++;
              }
            }
          } else {
            let j = 0;
            for (let i = 0; i < this.resultFilterDateHistogramShowInHtml['dataAggregation'].length - 1; i++) {
              if (i % 5 === 0) {
                this.countLineResultByAggregation[j] = i;
                j++;
              }
            }
          }
          this.showList = this.resultFilterDateHistogramShowInHtml['dataAggregation'];
        } else {
          this.showList = [
            this.resultFilterDateHistogramShowInHtml['aggregation'] + ' of '
            + this.resultFilterDateHistogramShowInHtml['nom_champ']
            + ' between [ ' + this.resultFilterDateHistogramShowInHtml['range'][0] + ', '
            + this.resultFilterDateHistogramShowInHtml['range'][1] + ' ]',
            this.resultFilterDateHistogramShowInHtml['dataAggregation'].value
          ];
        }

        this.localStorage.setItem('resultFilterDateHistogramShowInHtml',
                       JSON.stringify(this.resultFilterDateHistogramShowInHtml))
           .subscribe((r) => {console.log(r);
           });
      }
      this.loading = false;
    } catch (error) {
      // this.pnotify.error({
      //   text: error
      // });
    }
  }
  indexChangeFiltreBucket(resultat: any) {
    // console.log(resultat);
    // this.resultFilterDateHistogram.push({
    //   id: this.resultFilterDateHistogram.length + 1,
    //   data: resultat
    // });
  }
  /**
   * Cette fonction communique avec le composant metricAggregaComponent comme parent
   * pour recupérer l'id du composant et le composant à la demande ce celui ci (du composant)
   */
  recupererIdComposantChangeBucket(idComposant: any) {
    if (idComposant) {
      this.listeBucketsAggrega.map((el, incr) => {
        /**
         * Comparé si idComposant donné en parametre est le meme qu'un id dans le tableau
         * resultFilterDateHistogram
         */
        if (idComposant === el.id) {
          /**
           * Supprimer l'objet correspondant avec splice
           */
          this.listeBucketsAggrega.splice(incr, 1);
        }
      });
      this.localStorage.setItem('listeBucketsAggrega', JSON.stringify(this.listeBucketsAggrega))
        .subscribe((r) => {console.log(r);
        });
    }
  }
  // fin evenement pour recevoir les données du composant enfant buckets
  /**
   * @param event
   * Cette fontion permet de filtrer la liste des champs en un type number, string ...
   */
  filtreListField(event: any) {
    this.typeChampSelected = event.target.value;
    if (this.typeChampSelected === 'text') {
      this.contentArray = this.listFieldString.map(
        (field: string, i: number) => field
      );
      this.returnedArray = this.contentArray.slice(0, this.nombreItemShowForPaggination);
    } else if (this.typeChampSelected === 'number') {
      this.contentArray = this.listFieldNumber.map(
        (field: string, i: number) => field
      );
      this.returnedArray = this.contentArray.slice(0, this.nombreItemShowForPaggination);
    } else if (this.typeChampSelected === 'date') {
      this.contentArray = this.listFieldDate.map(
        (field: string, i: number) => field
      );
      this.returnedArray = this.contentArray.slice(0, this.nombreItemShowForPaggination);
    } else {
      this.contentArray = this.listFieldStringAll.map(
        (field: string, i: number) => field
      );
      this.returnedArray = this.contentArray.slice(0, this.nombreItemShowForPaggination);
    }
  }
  /**
   * cette fonction permet de charger l'ensemble des champs de l'index choisit
   */
  async loadListFieldOnView(index: string) {
    let type;
    this.loading = false;
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
        this.loading = true;
      }
    );
    this.contentArray = this.listFieldStringAll.map(
      (field: string, i: number) => field
    );
    this.returnedArray = this.contentArray.slice(0, this.nombreItemShowForPaggination);
  }

  recuprerListeChampPourFiltre(event: any) {
    console.log(event);
  }
}
