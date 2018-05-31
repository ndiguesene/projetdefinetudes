import { Config } from './../config/Config';
import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { ElasticsearchService } from '../services/elasticsearch.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  listeIndex: any;
  listeDashBoard = [];
  dataAllPortail = [];
  listeVisualisation = [];

  constructor(private es: ElasticsearchService,
              private router: Router) {}

  async ngOnInit() {
    await this.es.getAllDocumentsService(
      Config.INDEX.NOM_INDEX_FOR_MAPPING,
      Config.INDEX.TYPE,
      Config.NAME_FIELD_OF_MAPPING.VISUALIZATION).then(
      async res => {
        this.dataAllPortail = Object.values(res.hits.hits);
        await this.dataAllPortail.map(visua => {
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

}
