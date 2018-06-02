import { PnotifyService } from './../services/pnotify.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { ElasticsearchService } from './../services/elasticsearch.service';


@Component({
  selector: 'app-informationscluster',
  templateUrl: './informationscluster.component.html',
  styleUrls: ['./informationscluster.component.css']
})
export class InformationsclusterComponent implements OnInit {
  infoscluster: Promise<any>;
  couleurSanteCluster = '';
  listeIndexAndInfos: any;
  pnotify = this.ps.getPNotify();
  constructor(private es: ElasticsearchService,
              private ps: PnotifyService) { }

  ngOnInit() {
    try {
      this.es.findClusterInfosService().then(
        resp => {
          this.infoscluster = resp;
          if (this.infoscluster['status'] === 'yellow') {
            this.couleurSanteCluster = 'warning';
          } else if (this.infoscluster['status'] === 'red') {
            this.couleurSanteCluster = 'danger';
          } else if (this.infoscluster['status'] === 'green') {
            this.couleurSanteCluster = 'success';
          } else {
            this.couleurSanteCluster = '';
          }
        }, error => {
          this.pnotify.error({
            text: error
          });
        });
      /**
       * permet de charger les informations de l'ensemble du cluster
       */
      this.getListIndexStat();
    } catch (error) {
      this.pnotify.error({
        text: error
      });
    }
  }
  getListIndexStat(): any {
    return this.es.getAllStatIndexOnCluster(['indices']).then(
      res => {
        this.listeIndexAndInfos = res.indices;
      }
    );
  }

}
