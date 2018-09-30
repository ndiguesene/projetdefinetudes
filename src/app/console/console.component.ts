import { ElasticsearchService } from './../services/elasticsearch.service';
import { Config } from './../config/Config';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.css']
})
export class ConsoleComponent implements OnInit, AfterViewInit {
  URL = Config.BASE_URL;
  options: any = {maxLines: 500, printMargin: true};

  index = '';
  query: any;
  reponse: any;

  @ViewChild('editor') editor;

  constructor(private es: ElasticsearchService) { }
  ngAfterViewInit() {
    this.editor.setTheme('github');
    this.editor.setMode('json');
    this.editor.getEditor().setOptions({
      enableBasicAutocompletion: true
    });

    this.editor.getEditor().commands.addCommand({
      name: 'showOtherCompletions',
      bindKey: 'Ctrl-.',
      exec: function (editor) {
        console.log(editor);
      }
    });
  }
  ngOnInit() {

  }
  async envoyerRequete() {
    const requ = JSON.stringify(this.query);
    const urlAndMethod = (requ.toString().split('n{')[0])
      .toString()
      .trim()
      .replace('"', '');
    const urlAndMethodSet = urlAndMethod.substring(0, urlAndMethod.length - 1).split(' ');
    this.index = urlAndMethodSet[1].split('/')[0];


    const requete = '{' + (requ.toString().split('{')[1]);
    console.log(requete);
    console.log(JSON.parse(requete));


    // await this.es.getSearchWithAgg(this.index, this.query).then(
    //   async response => this.reponse = await response,
    //   async error => this.reponse = await error
    // );
  }

}
