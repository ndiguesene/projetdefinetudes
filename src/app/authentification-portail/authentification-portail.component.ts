import { Validators, FormBuilder } from '@angular/forms';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Component, OnInit } from '@angular/core';
import { ElasticsearchService } from '../services/elasticsearch.service';
import { Router } from '@angular/router';
import * as $ from 'jquery';
declare var $: any;
@Component({
  selector: 'app-authentification-portail',
  templateUrl: './authentification-portail.component.html',
  styleUrls: ['./authentification-portail.component.css']
})
export class AuthentificationPortailComponent implements OnInit {
  form: any;
  error = false;
  constructor(private fb: FormBuilder,
              private router: Router,
              protected localStorage: LocalStorage,
              private es: ElasticsearchService) {
        this.form = this.fb.group({
          email: ['', [Validators.required, Validators.email]],
          password: ['', Validators.required]
        });
      }

  ngOnInit() {
    if (localStorage.getItem('email')) {
      this.router.navigate(['/accueil']);
      // localStorage.clear();
    }

    if (this.es.email === '' && this.es.motdepasse === '') {
      // $('#modalForConnexion').modal('show');
      this.es.isAuth = false;
    } else {
      // $('#modalForConnexion').modal('hide');
      this.es.isAuth = true;
      this.router.navigate(['/accueil']);
    }
  }
  onSubmit() {
    // this.auth.sendToken('ndigue');
    if ((this.form.value.email === 'elastic') && (this.form.value.password === 'elastic')) {
      this.es.email = this.form.value.email;
      this.es.motdepasse = this.form.value.password;
      this.es.isAuth = true;
      this.error = false;
    } else {
      this.es.isAuth = false;
      this.error = true;
    }
      /* this.es.userAuthentication(userName,password).subscribe((data : any)=>{
       localStorage.setItem('userToken',data.access_token);
       this.router.navigate(['/home']);
     },
     (err : HttpErrorResponse)=>{
       this.isLoginError = true;
     }); */
   }
}
