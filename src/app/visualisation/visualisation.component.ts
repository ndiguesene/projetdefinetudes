import { Config } from './../config/Config';
import { Component, OnInit } from '@angular/core';
import { ElasticsearchService } from '../services/elasticsearch.service';
import 'rxjs/add/operator/map';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.css']
})
export class VisualisationComponent implements OnInit {
  listeVisualisation = new Array<any>();
  dataAllPortail = [];
  listeIndex: Promise<any>;
  nomIndexChoisi = "";
  nomChart = '';

  font_size = false;
  showCollapseListChart = false;
  constructor(private es: ElasticsearchService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.es.getAllDocumentsService(
      Config.INDEX.NOM_INDEX_FOR_MAPPING,
      Config.INDEX.TYPE,
      Config.NAME_FIELD_OF_MAPPING.VISUALIZATION).then(
      res => {
        this.dataAllPortail = Object.values(res.hits.hits);
        this.dataAllPortail.map(visua => {
          /**
           *  ici vu que le contenu de l'objet enregistré dans la base est un objet qu'on a converti
           * en string , on le parse pour recupérer l'objet en tant que tel
           **/
          visua['_source'].visualization.visState = JSON.parse(visua['_source'].visualization.visState);
        });
        this.listeVisualisation = this.dataAllPortail;
      }
    );
    this.getAllIndex();
    // permet d'afficher le collapse automatiquement de la liste des chart a créér sil est est 'true'
    this.route.queryParamMap.subscribe(async params => {
      if (params.get('showCollapse')) {
        this.showCollapseListChart = (params.get('showCollapse') === 'true') ? true : false;
      }
    });
    this.es.getDefaultIndexService().then(p => {
      if (p['hits']["hits"][0]._source.config.defaultIndex)
        this.nomIndexChoisi = p['hits']["hits"][0]._source.config.defaultIndex;
      else
        this.nomIndexChoisi = "";
    })
  }
  getNameVisualisation(nomChart: string = '') {
    this.nomChart = nomChart;
  }
  changeStyleForLienTypeChart(event: any) {
    this.font_size = event.type === 'mouseover' ? true : false;
  }
  getAllIndex() {
    this.es.getAllIndexService().then(
      resp => {
        this.listeIndex = resp;
      }
    );
  }
  getNomIndex(event: any) {
    let element;
    element = event.target;
    if (element.value !== 'Nom index') {
      this.nomIndexChoisi = element.value;
    }
  }
  removeVisualisation(event: any, id) {
    if (confirm('Are you sure to delete ' + id)) {
      console.log('Implement delete functionality here');
      this.es.deleteDoc(Config.INDEX.NOM_INDEX_FOR_MAPPING, Config.INDEX.TYPE, id);
    }
    // console.log(id);
    // console.log(event);
    // this.es.deleteDoc(Config.INDEX.NOM_INDEX_FOR_MAPPING, Config.INDEX.TYPE, id);
  }
}
