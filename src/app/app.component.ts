import { PnotifyService } from './services/pnotify.service';
import { PNotify } from 'pnotify/dist/es/PNotify';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { ElasticsearchService } from './services/elasticsearch.service';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  indexParDefaut = '';
  pnotify = undefined;

  constructor(private _loadingBar: SlimLoadingBarService,
              private translate: TranslateService,
              private es: ElasticsearchService,
              private ps: PnotifyService) {
    translate.setDefaultLang('fr');
    this.translate.use('fr');
    this.indexParDefaut = this.es.getDefaultIndexService();
    // this.es.createIndexService('gestionpersonne');
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }
  ngOnInit() {
  }
  isAuthenticated() {
    return this.es.isAuth;
  }
}
