import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ElasticsearchService } from '../services/elasticsearch.service';

@Component({
  selector: 'app-creercompte',
  templateUrl: './creercompte.component.html',
  styleUrls: ['./creercompte.component.css']
})
export class CreercompteComponent implements OnInit {
  loginForm: any;
  user: any;
  listeChamp = [];
  userActif: boolean;
  /* infosUser: any = {
    email: 'elastic',
    motdepasse: 'wSQ4RPnwQEB4PdzlV8aB'
  }; */

  constructor(private es: ElasticsearchService) {
    this.loginForm = new FormGroup({
        nom: new FormControl('', Validators.required),
        prenom: new FormControl('', Validators.required),
        email: new FormControl('', Validators.required),
        motdepasse: new FormControl('', Validators.required),
        role: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.init();
  }
  init() {
    this.es.getAllUser().subscribe(
      p => {
        this.listeChamp.push(Object.values(p));
        this.listeChamp = this.listeChamp[0].filter(
          u => (u.username !== 'elastic' && u.username !== 'logstash' && u.username !== 'logstash_system' && u.username !== 'kibana')
        );
      }
    );
  }
  removeUser(username) {
    this.es.removeUser(username).subscribe(
      q => {console.log(q); this.init(); },
      error => alert(error)
    );
  }
  enabledUser(username) {
    this.es.enabledUser(username).subscribe(
      res => console.log(res)
    );
  }
  onFormSubmit() {
    if (this.loginForm.valid) {
      this.user = this.loginForm.value;
      const obj = {
        password : this.user.motdepasse,
        roles : [this.user.role],
        full_name : this.user.prenom + ' ' + this.user.nom,
        email : this.user.email,
        metadata : {
          intelligence : 7
        }
      };
      this.es.create(obj, this.user.email, this.es.email, this.es.motdepasse).subscribe(
        q => {
          console.log(q);
          this.init();
        },
        error => alert(error)
      );
    }
  }
}
