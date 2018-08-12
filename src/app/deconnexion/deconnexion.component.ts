import { ElasticsearchService } from './../services/elasticsearch.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deconnexion',
  templateUrl: './deconnexion.component.html',
  styleUrls: ['./deconnexion.component.css']
})
export class DeconnexionComponent implements OnInit {

  constructor(private router: Router, private es: ElasticsearchService) { }

  ngOnInit() {
    this.es.email = '';
    this.es.motdepasse = '';
    console.log('Email vide ' + this.es.email);
    localStorage.clear();
    this.router.navigate(['/']);
  }

}
