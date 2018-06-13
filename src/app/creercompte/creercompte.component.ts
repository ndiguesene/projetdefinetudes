import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-creercompte',
  templateUrl: './creercompte.component.html',
  styleUrls: ['./creercompte.component.css']
})
export class CreercompteComponent implements OnInit {
  loginForm: FormGroup;
  user: any;
  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
        email: [null, Validators.required],
        motdepasse: [null, [Validators.required, Validators.minLength(8)]]
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
