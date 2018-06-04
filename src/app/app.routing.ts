import { DashboardlisteComponent } from './dashboard/dashboardliste.component';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ParametresComponent } from './parametres/parametres.component';
import { ConsoleComponent } from './console/console.component';
import { VisualisationComponent } from './visualisation/visualisation.component';
import { AccueilComponent } from './accueil/accueil.component';
import { ExplorationComponent } from './exploration/exploration.component';
import { InformationsclusterComponent } from './informationscluster/informationscluster.component';
import { ConfigureComponent } from './visualisation/configure/configure.component';
import { NotFoundComponent } from './not-found/not-found.component';


const routes: Routes = [
	{ path: '', component: AccueilComponent, pathMatch: 'full'},
	{ path: 'accueil', component: AccueilComponent },
	{ path: 'exploration', component: ExplorationComponent },
	{ path: 'dashboards', component: DashboardlisteComponent },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'parametres', component: ParametresComponent },
	{ path: 'console', component: ConsoleComponent },
	{ path: 'visualisation', component: VisualisationComponent },
	{ path: 'infoscluster', component: InformationsclusterComponent },
	{ path: 'visualisation/:id', component: ConfigureComponent },
	{ path: '**', component: NotFoundComponent }
];

export const routing = RouterModule.forRoot(routes);