import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-creercompte',
  templateUrl: './creercompte.component.html',
  styleUrls: ['./creercompte.component.css']
})
export class CreercompteComponent implements OnInit {
  loginForm: any;
  user: any;
  constructor(private fb: FormBuilder) {
    this.loginForm = new FormGroup({
        nom: new FormControl(null, Validators.required),
        prenom: new FormControl(null, Validators.required),
        email: new FormControl(null, Validators.required),
        motdepasse: new FormControl(null, Validators.required),
    });
  }

  ngOnInit() {

  }
  onFormSubmit() {
    if (this.loginForm.valid) {
      this.user = this.loginForm.value;
      console.log(this.user);
    }
  }

}
