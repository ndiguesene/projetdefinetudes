import { PnotifyService } from './../services/pnotify.service';
import { Component, OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import { ElasticsearchService } from './../services/elasticsearch.service';


@Component({
  selector: 'app-informationscluster',
  templateUrl: './informationscluster.component.html',
  styleUrls: ['./informationscluster.component.css']
})
export class InformationsclusterComponent implements OnInit {
  infoscluster = new Promise(
    (resolve, reject) => {
      setInterval(
        () => {
          this.loadInfos();
          resolve(this.infoscluster);
        }, 5000
      );
    }
  );

  infosclusterAll = new Promise(
    (resolve, reject) => {
      setInterval(
        () => {
          this.loadInfos();
          resolve(this.infosclusterAll);
        }, 5000
      );
    }
  );
  couleurSanteCluster = '';
  listeIndexAndInfos: any;
  pnotify = this.ps.getPNotify();
  constructor(private es: ElasticsearchService,
              private ps: PnotifyService) { }

  ngOnInit() {
    try {
      this.loadInfos();
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
  loadInfos() {
    this.es.findClusterInfosService().then(
      resp => {
        this.infoscluster = resp;
        if (this.infoscluster['status'] === 'yellow') {
          this.couleurSanteCluster = 'warning';
        } else if (this.infoscluster['status'] === 'red') {
          this.couleurSanteCluster = 'danger';
          this.pnotify.error({
            text: 'ATTENTION !!! Votre cluster est en de santé rouge.'
          });
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

      this.es.getAllStatIndexOnCluster().then(
        r => {
          this.infosclusterAll = r.nodes;
          const listObjectOnNoeud = Object.keys(this.infosclusterAll[Object.keys(this.infosclusterAll)[0]]);
          this.infosclusterAll = this.infosclusterAll[Object.keys(this.infosclusterAll)[0]];
        }
      );
  }
  getListIndexStat(): any {
    return this.es.getAllStatIndexOnCluster(['indices']).then(
      res => {
        this.listeIndexAndInfos = res.indices;
      }
    );
  }

}
