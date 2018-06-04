import { DashboardGridsterConfigService } from './dashboard/dashboardgridsterconfig.service';
import { PnotifyService } from './services/pnotify.service';
import { BucketsService } from './services/buckets.service';
import { MetricsService } from './services/metrics.service';
import { LoaderInterceptorService } from './interceptors/loader-interceptor.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';

import { routing } from './app.routing';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardlisteComponent } from './dashboard/dashboardliste.component';
import { ParametresComponent } from './parametres/parametres.component';
import { ConsoleComponent } from './console/console.component';
import { VisualisationComponent } from './visualisation/visualisation.component';
import { AccueilComponent } from './accueil/accueil.component';
import { ExplorationComponent } from './exploration/exploration.component';

import { HttpModule } from '@angular/http';
import { InformationsclusterComponent } from './informationscluster/informationscluster.component';
import { ConfigureComponent } from './visualisation/configure/configure.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ElasticsearchService } from './services/elasticsearch.service';
import { ChartService } from './services/chart.service';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PaginationModule } from 'ngx-bootstrap';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SlimLoadingBarModule } from 'ng2-slim-loading-bar';
import { MetricsAggregaComponent } from './exploration/metrics-aggrega/metrics-aggrega.component';
import { BucketsAggregaComponent } from './exploration/buckets-aggrega/buckets-aggrega.component';

import { LocalStorageModule } from '@ngx-pwa/local-storage';
import { DatePipe } from '@angular/common';

import { Ng4GeoautocompleteModule } from 'ng4-geoautocomplete';
import { GridsterModule } from 'angular-gridster2';

// export const createTranslateLoader = (http: HttpClient) => {
//   return new TranslateHttpLoader(http, './../assets/i18n/', '.json');
// };

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    NavbarComponent,
    FooterComponent,
    DashboardComponent,
    DashboardlisteComponent,
    ParametresComponent,
    ConsoleComponent,
    VisualisationComponent,
    AccueilComponent,
    ExplorationComponent,
    InformationsclusterComponent,
    ConfigureComponent,
    NotFoundComponent,
    MetricsAggregaComponent,
    BucketsAggregaComponent
  ],
  imports: [
    BrowserModule,
    GridsterModule,
    LocalStorageModule,
    FormsModule,
    Ng4GeoautocompleteModule.forRoot(),
    BrowserAnimationsModule,
    AngularFontAwesomeModule,
    routing,
    HttpModule,
    HttpClientModule,
    ChartsModule,
    HttpClientModule,
    HttpClientModule,
    FormsModule,
    SlimLoadingBarModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    ElasticsearchService, ChartService, MetricsService, BucketsService, PnotifyService, DashboardGridsterConfigService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptorService,
      multi: true,
    },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
