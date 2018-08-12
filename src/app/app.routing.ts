import { DeconnexionComponent } from './deconnexion/deconnexion.component';
import { AuthGuard } from './auth/auth.guard';
import { CreercompteComponent } from './creercompte/creercompte.component';
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
import { AuthentificationPortailComponent } from './authentification-portail/authentification-portail.component';


const routes: Routes = [
	// { path: '', redirectTo: '/login', pathMatch : 'full'},
	// { path: '', component: AccueilComponent, pathMatch: 'full'},
	{ path: '', component: AuthentificationPortailComponent, pathMatch: 'full' },
	{ path: 'accueil', component: AccueilComponent, canActivate: [AuthGuard] },
	{ path: 'exploration', component: ExplorationComponent, canActivate: [AuthGuard] },
	{ path: 'dashboards', component: DashboardlisteComponent, canActivate: [AuthGuard] },
	{ path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
	{ path: 'parametres', component: ParametresComponent, canActivate: [AuthGuard]},
	{ path: 'console', component: ConsoleComponent, canActivate: [AuthGuard]},
	{ path: 'visualisation', component: VisualisationComponent, canActivate: [AuthGuard]},
	{ path: 'infoscluster', component: InformationsclusterComponent, canActivate: [AuthGuard]},
	{ path: 'visualisation/:id', component: ConfigureComponent, canActivate: [AuthGuard]},
	{ path: 'login', component: AuthentificationPortailComponent },
	{ path: 'logout', component: DeconnexionComponent, canActivate: [AuthGuard] },
	{
		path: 'creerutilisateur',
		component: CreercompteComponent,
		canActivate: [AuthGuard]
	},
	{ path: '**', component: NotFoundComponent }
];

export const routing = RouterModule.forRoot(routes);
