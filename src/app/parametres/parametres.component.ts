import { Component, OnInit } from '@angular/core';
import { ElasticsearchService } from '../services/elasticsearch.service';

@Component({
  selector: 'app-parametres',
  templateUrl: './parametres.component.html',
  styleUrls: ['./parametres.component.css']
})
export class ParametresComponent implements OnInit {
  listeSetting: Promise<any>;
  listeIndex: Promise<any>;
  indexChoisi = '';
  statIndex: Promise<any>;

  buttonDisabledSetIndex = false;

  constructor(private es: ElasticsearchService) { }
  ngOnInit() {
    this.getAllListeIndex();
    this.getAllSettings();
  }
  verifieSelectIndexMenuDeroulante(val: string): boolean {
    if (val === '' || val === 'nom_index') {
      return false;
    }
    return true;
  }
  removeIndex() {
    /**
     * Cette instruction permet de supprimer l'index choisi
    */
    this.es.removeIndexService(this.indexChoisi);
    /**
     * Apres suppression de l'index je met a jour la liste des index du menu déroulant
     */
    this.getAllListeIndex();
  }
  getStatIndex() {
    this.es.getStatIndexService(this.indexChoisi).then(
      resp => {
        this.statIndex = resp._all.primaries;
      }
    );
  }
  selectionIndex(event: any) {
    let val;
    val = event.target.value;
    if (this.verifieSelectIndexMenuDeroulante(val)) {
      /**
       * J'affecte le nom de l'index choisi a la variable 'indexChoisi' pour la suppression de celui ci
       */
      this.buttonDisabledSetIndex = true;
      this.indexChoisi = val;
    } else {
      this.buttonDisabledSetIndex = false;
    }
  }
  getAllListeIndex() {
    this.es.getAllIndexService().then(
  		res => {
  			this.listeIndex = res;
  		},
  		error => {
  			this.listeIndex = error;
  		}
    );
  }
  getAllSettings(_index: string = '') {
    this.es.getAllSettings(_index).then(
  		res => {
  			this.listeSetting = res;
  		},
  		error => {
  			this.listeSetting = error;
  		}
    );
  }

}
