import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ElasticsearchService } from '../services/elasticsearch.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private es: ElasticsearchService,
              private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      /* if (this.es.connect()) {
        return true;
      } else {
        this.router.navigate(['/login'], {
          queryParams: {
            return: state.url
          }
        });
        return false;
      } */
      if (this.es.connect(this.es.email, this.es.motdepasse)) {
        // this.router.navigate(['/accueil']);
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
      /* if (localStorage.getItem('email')) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      } */
  }
}
