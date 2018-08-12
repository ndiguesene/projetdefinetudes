import { ElasticsearchService } from './../services/elasticsearch.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private full_name = '';
  constructor(private es: ElasticsearchService) { }

  ngOnInit() {
    this.es.getUserAuthentificate().subscribe(
      p => {
        if (p.full_name === null) {
          this.full_name = p.username;
        } else {
          this.full_name = p.full_name;
        }
        console.log('Full Name ' + this.full_name);
      }
    );
  }

}
