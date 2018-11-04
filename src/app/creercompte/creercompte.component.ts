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
  user = {
    password : '',
    roles : [],
    full_name : '',
    email : ''
  };
  listeChamp = [];
  userActif: boolean;

  alreadyExistUser = false;
  /* infosUser: any = {
    email: 'elastic',
    motdepasse: 'wSQ4RPnwQEB4PdzlV8aB'
  }; */

  constructor(private es: ElasticsearchService) {
    this.loginForm = new FormGroup({
        nom: new FormControl('', Validators.required),
        prenom: new FormControl('', Validators.required),
        email: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
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
        // this.listeChamp = this.listeChamp[0].filter(
        //   u => (u.username !== 'elastic' && u.username !== 'logstash' && u.username !== 'logstash_system' && u.username !== 'kibana')
        // );
      });
      if (this.listeChamp.length === 0) {
        this.listeChamp.push({
        username: "elastic",
        email: "elastic@admin",
        roles: "superuser",
        full_name: "elastic"
      });
      }
      
  }
  checkIfEmailExist(username): boolean {
    return (this.listeChamp.filter(item => item.username === username).length === 0) ? false : true;
  }
  removeUser(username) {
    this.es.removeUser(username).subscribe(
      q => {
        console.log(q); 
        this.init(); 
      },
      error => console.log(error)
    );
    this.listeChamp = this.listeChamp.filter(item => item.username !== username);
  }
  enabledUser(username) {
    this.es.enabledUser(username).subscribe(
      res => console.log(res)
    );
  }
  genererPassword() {
    this.loginForm.value.password = Math.random().toString(36).slice(-8);
    this.user.password = this.loginForm.value.password;
  }
  onFormSubmit() {
    if (this.loginForm.valid) {
      this.user.password = this.loginForm.value.password,
      this.user.roles = [this.loginForm.value.role];
      this.user.full_name = this.loginForm.value.prenom + ' ' + this.loginForm.value.nom;
      this.user.email = this.loginForm.value.email;
      console.log(this.checkIfEmailExist(this.user.email.split("@")[0]));
      console.log(this.user.email.split("@")[0]);
      if (!this.checkIfEmailExist(this.user.email.split("@")[0])) {
        this.listeChamp.push({
          username: this.user.email.split("@")[0],
          email: this.user.email,
          roles: this.user.roles,
          full_name: this.user.full_name
        });
        this.alreadyExistUser = false;
      } else {
        this.alreadyExistUser = true;
      }
      this.es.create(this.user, this.user.email, this.es.email, this.es.motdepasse).subscribe(
        q => {
          this.init();
        },
        error => console.log(error)
      );
    }
  }
}
