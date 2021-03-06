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
  listeValues = [];
  listeKeys = [];

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
  definirIndexPardefaut() {
    alert(this.indexChoisi);
  }
  async removeIndex() {
    /**
     * Cette instruction permet de supprimer l'index choisi
    */
    await this.es.removeIndexService(this.indexChoisi);
    /**
     * Apres suppression de l'index je met a jour la liste des index du menu déroulant
     */
    this.getAllListeIndex();
  }
  async getStatIndex() {
    await this.es.getStatIndexService(this.indexChoisi).then(
      async resp => {
        this.statIndex = await resp._all.primaries;
        console.log(this.statIndex);
      }
    );
  }
  selectionIndex(event: any) {
    const val = event.target.value;
    if (this.verifieSelectIndexMenuDeroulante(val)) {
      /**
       * J'affecte le nom de l'index choisi a la variable 'indexChoisi' pour la suppression de celui ci
       */
      this.buttonDisabledSetIndex = true;
      this.indexChoisi = val;
      this.getStatIndex();
    } else {
      this.buttonDisabledSetIndex = false;
      this.statIndex = null;
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
