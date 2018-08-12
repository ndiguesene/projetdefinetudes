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
      $('#modalForConnexion').modal('show');
    } else {
      $('#modalForConnexion').modal('hide');
      this.router.navigate(['/accueil']);
    }
  }
  onSubmit() {
    // this.auth.sendToken('ndigue');
    if (this.form.value.email === 'ok') {
      this.es.email = 'elastic';
      this.es.motdepasse = 'elastic';
      console.log(this.es.motdepasse);
      localStorage.setItem('email', 'ndigue');
      $('#modalForConnexion').modal('hide');
      this.router.navigate(['/accueil']);
    } else {

    }
      /* this.es.userAuthentication(userName,password).subscribe((data : any)=>{
       localStorage.setItem('userToken',data.access_token);
       this.router.navigate(['/home']);
     },
     (err : HttpErrorResponse)=>{
       this.isLoginError = true;
     }); */
   }
   onClear() {

   }

}
