import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Client } from 'elasticsearch';
import { Router } from '@angular/router';
import { Config } from '../config/Config';
import * as bodybuilder from 'bodybuilder';

@Injectable()
export class ElasticsearchService {
  public email = '';
  public motdepasse = '';
  public full_name = '';

  private client: Client;
  queryalldocs = {
    'query': {
      'match_all': {}
    }
  };
  queryallForGetType = {
    'aggs': {
      'name_type': {
        'terms': {
          'field': '_type'
        }
      }
    }
  };
  public connect(email = 'elastic', motdepasse = 'elastic') {
    this.email = email;
    this.motdepasse = motdepasse;
    const host = 'http://' + email + ':' + motdepasse + '@' + Config.BASE_URL;
    // console.log(host);
    // admin:admin@
    this.client = new Client({
      // host: 'http://' + email + ':' + motdepasse + '@localhost:9200',
      host: host,
      // host: host,
      log: 'error'
    });
    if (this.client) {
      return true;
    }
    return false;
  }
  constructor(private http: HttpClient, private router: Router) {
    try {
      if (!this.client) {
        this.connect();
      }
    } catch (error) {
      this.router.navigate(['login']);
    }
    // création de l'index '.portail'
    // this.client.exists({
    //   index: Config.INDEX.NOM_INDEX_FOR_MAPPING,
    //   type: '',
    //   id: 1
    // }, function (error, exists) {
    //   if (exists === false) {
      try {
        // this.createIndexService();
      } catch (error) {
        console.log(error);
      }
    //   }
    // });
  }
  getStatIndexService(_nomIndex: string): any {
    return this.client.indices.stats({
      index: _nomIndex,
      filterPath: ['_all.primaries']
    });
  }
  getAllStatIndexOnCluster(filtrePath?: string[]): any {
    // this.getDefaultIndexService().then(
    //   resp => console.log(resp)
    // );
    return this.client.nodes.stats({});
  }
  getIfIndexExist(nameIndex: string): any {
    const body = bodybuilder()
            .query('match', '_index', nameIndex)
            .build();
      return this.client.search({
        body: body
      });
  }
  getAllDocumentsService(_index, _type, type_champ_or_filtre: string = '', from = 0,
  size = Config.SIZE_MAX_RESULT_QUERY_RETURN): any {
    if (type_champ_or_filtre !== '') {
      const body = bodybuilder()
            .query('match', Config.NAME_FIELD_OF_MAPPING.TYPE, Config.NAME_FIELD_OF_MAPPING.VISUALIZATION)
            .build();
      return this.client.search({
        index: _index,
        from: from,
        size: size,
        // type: _type,
        body: body,
        filterPath: ['hits.hits']
      });
    } else {
      return this.client.search({
        index: _index,
        // type: _type,
        size: size,
        body: this.queryalldocs,
        filterPath: ['hits.hits']
      });
    }
  }
  getByIdService(_index, id): any {
    const body = bodybuilder()
        .query('match', 'type', Config.NAME_FIELD_OF_MAPPING.VISUALIZATION)
        .filter('term', '_id', id)
        .build();
    return this.client.search({
      index: _index,
      // type: _type,
      body: body,
      filterPath: ['hits.hits']
    });
  }
  getAllDocumentsServiceByRequete(_index, query, _size = Config.SIZE_MAX_RESULT_QUERY_RETURN): any {
    return this.client.search({
      index: _index,
      // type: _type,
      body: query,
      filterPath: ['hits.hits'],
      size: _size
    });
  }
  getSearchWithAgg(_index, _query, size = Config.SIZE_MAX_RESULT_QUERY_RETURN, _type?): any {
    return this.client.search({
      index: _index,
      type: _type,
      body: _query,
      size: size
      // filterPath: ['aggregations'],
    });
  }
  create(body, newUsernameForCreation, login, motdepasse): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa(login + ':' + motdepasse));
    headers = headers.append('Content-Type', 'application/json');

    return this.http.post('http://' + Config.BASE_URL + '/_xpack/security/user/' + newUsernameForCreation, body, { headers });
  }
  removeUser(username) {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa(this.email + ':' + this.motdepasse));
    headers = headers.append('Content-Type', 'application/json');
    return this.http.delete('http://' + Config.BASE_URL + '/_xpack/security/user/' + username, { headers });
  }
  enabledUser(username): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa(this.email + ':' + this.motdepasse));
    headers = headers.append('Content-Type', 'application/json');
    // if (!userActif === false) {
    let etat;
    let data = [];
    this.getAllUser()
        .subscribe((dat) => {
          const key = Object.keys(dat);
          for (const prop of key) {
            data.push(dat[prop]);
          }
          data = data.filter(c => c.username === username);
          etat = data[0].enabled;
          // console.log(etat);
        if (etat) {
          return this.http.put('http://' + Config.BASE_URL + '/_xpack/security/user/' + username + '/_disable', { headers });
        }
        });
      return this.http.put('http://' + Config.BASE_URL + '/_xpack/security/user/' + username + '/_enable', { headers });
  }
  getAllUser(): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa(this.email + ':' + this.motdepasse));
    headers = headers.append('Content-Type', 'application/json');

    return this.http.get('http://' + Config.BASE_URL + '/_xpack/security/user/', { headers });
  }
  getUserAuthentificate(): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', 'Basic ' + btoa(this.email + ':' + this.motdepasse));
    headers = headers.append('Content-Type', 'application/json');

    return this.http.get('http://' + Config.BASE_URL + '/_xpack/security/user/' + this.email, { headers });
  }

  fullTextSearchService(index, chaine): any {
    return this.client.search({
      index: index,
      body: {
        'query': {
          'multi_match': {
            'query': chaine,
            'type': 'phrase_prefix'
          }
        }
      }
    });
  }
  getDefaultIndexService(): any {
    const body = bodybuilder()
            .query('match', 'type', 'config')
            .build();
    return this.client.search({
      body: body
    });
  }
  getAllIndexService(): any {
    return this.client.cat.indices({
      format: 'json'
    });
  }
  getNameType(index): Promise<string> {
    return this.getNameTypeByIndexName(index, this.queryallForGetType).then(
      /**
       * Ici on recupere le premier type on niveau de l'index supposant qu'il ya un seul type
       * dans l'index avec l'instructon (res.aggregations.name_type.buckets[0]) le '0' indique
       * le premier type
       */
      res => Object.values(res.aggregations.name_type.buckets[0])[0]
    );
  }

  getAllFieldsByIndexService(nomIndex: string, _type: string): any {
    return this.client.indices.getFieldMapping({
      index: nomIndex,
      // type: _type,
      fields: '*',
      filterPath: [nomIndex + '.mappings']
    });
  }
  getNameTypeByIndexName(_index: string, query): any {
    return this.client.search({
      index: _index,
      body: query,
      filterPath: ['aggregations.name_type.buckets'],
      size: 0
    });
  }
  getAllDocumentsWithScrollService(_index, _type, _from: number = 0, _size: number = 10, _order: string = 'asc'): any {
    return this.client.search({
      index: _index,
      type: _type,
      scroll: '1m',
      filterPath: ['hits.hits._source', 'hits.total', '_scroll_id'],
      body: {
        'from': _from,
        'size': _size,
        'query': {
          'match_all': {}
        },
        'sort': [
          { '_uid': { 'order': _order } }
        ]
      }
    });
  }
  getNextPageService(scroll_id): any {
    return this.client.scroll({
      scrollId: scroll_id,
      scroll: '1m',
      filterPath: ['hits.hits._source', 'hits.total', '_scroll_id']
    });
  }
  getAllSettings(_index: string = ''): any {
    return this.client.indices.getSettings({
      index: _index
    });
  }
  // async function putBookMapping () {
  //   const schema = {
  //     title: { type: 'keyword' },
  //     author: { type: 'keyword' },
  //     location: { type: 'integer' },
  //     text: { type: 'text' }
  //   }
  //   return this.client.indices.putMapping({ index, type, body: { properties: schema } })
  // }
  findClusterInfosService(): any {
    return this.client.cluster.health({});
  }
  existDocument(index: string, type: string, body: any): PromiseLike<any> {
    return this.client.search({
        index: index,
        type: type,
        body: body
    }).then(res => {
      let isNew;
      isNew = (res.hits.hits.length === 0) ? false : true;
      return [
        {
          isExist: isNew, data: res.hits.hits
        }
      ];
    });
  }
  createIndexService(): any {
    return this.client.indices.create(
      {
        index: Config.INDEX.NOM_INDEX_FOR_MAPPING,
        body: {
          'mappings': {
            'doc': {
              'dynamic': 'strict',
              'properties': {
                'config': {
                  'properties': {
                    'defaultIndex': {
                      'type': 'text',
                      'fields': {
                        'keyword': {
                          'type': 'keyword',
                          'ignore_above': 256
                        }
                      }
                    }
                  }
                },
                'dashboard': {
                  'properties': {
                    'description': {
                      'type': 'text'
                    },
                    // 'hits': {
                    //   'type': 'integer'
                    // },
                    'optionsJSON': {
                      'type': 'text'
                    },
                    'panelsJSON': {
                      'type': 'text'
                    },
                    // 'refreshInterval': {
                    //   'properties': {
                    //     'display': {
                    //       'type': 'keyword'
                    //     },
                    //     'pause': {
                    //       'type': 'boolean'
                    //     },
                    //     'section': {
                    //       'type': 'integer'
                    //     },
                    //     'value': {
                    //       'type': 'integer'
                    //     }
                    //   }
                    // },
                    'title': {
                      'type': 'text'
                    },
                    'uiStateJSON': {
                      'type': 'text'
                    }
                    // ,
                    // 'version': {
                    //   'type': 'integer'
                    // }
                  }
                },
                // 'index-pattern': {
                //   'properties': {
                //     'fieldFormatMap': {
                //       'type': 'text'
                //     },
                //     'fields': {
                //       'type': 'text'
                //     },
                //     'title': {
                //       'type': 'text'
                //     }
                //   }
                // },
                'type': {
                  'type': 'keyword'
                },
                'updated_at': {
                  'type': 'date'
                },
                /* 'user': {
                  'properties': {
                    'email': {
                      'type': 'text'
                    },
                    'prenom': {
                      'type': 'text'
                    },
                    'nom': {
                      'type': 'text'
                    },
                    'mot_de_passe': {
                      'type': 'text'
                    },
                    'role': {
                      'type': 'text'
                    },
                    'enabled': {
                      'type': 'boolean'
                    },
                    'otherOptions': {
                      'type': 'text'
                    },
                    'date_creation': {
                      'type': 'date'
                    },
                  }
                }, */
                'visualization': {
                  'properties': {
                    'description': {
                      'type': 'text'
                    },
                    'title': {
                      'type': 'text'
                    },
                    'uiStateJSON': {
                      'type': 'text'
                    },
                    // 'version': {
                    //   'type': 'integer'
                    // },
                    'visState': {
                      'type': 'text'
                    }
                  }
                }
              }
            }
          }
        }
      }
    );
  }
  removeIndexService(_name): any {
    return this.client.indices.delete({ index: _name });
  }
  fullTextSearchOnClusterService(_field, _queryText): any {
    return this.client.search({
      filterPath: ['hits.hits._index', 'hits.total', '_scroll_id'],
      body: {
        'query': {
          'multi_match': {
            'query': _queryText,
            'fields': [],
            'type': 'phrase_prefix'
          }
        }
      },
      '_source': []
    });
  }
  createDoc(index: string, type: string, body: any): PromiseLike<any> {
    return this.client.index({
      index: index,
      type: type,
      body: body
    }).then(
      response => console.log('ELASTICSEARCH - SERVICE - CREATE SUCCESS'),
      error => console.log(error)
    );
  }
  updateDoc(index: string, type: string, id: any, body: any): PromiseLike<any> {
    return this.client.index({
      id: id,
      index: index,
      type: type,
      body: body
    }).then(
      response => console.log('ELASTICSEARCH - SERVICE - UPDATE SUCCESS'),
      error => console.log(error)
    );
  }
  count(index: string, query): PromiseLike<any> {
    return this.client.count({
      index: index,
      body: query
    }).then(
      response => console.log('ELASTICSEARCH - SERVICE - COUNT SUCCESS'),
      error => console.log(error)
    );
  }
  deleteDoc(index: string, type: string, id: string): PromiseLike<any> {
    return this.client.delete({
      index: index,
      type: type,
      id: id,
      refresh: 'wait_for'
    }).then(
      response => console.log('ELASTICSEARCH - SERVICE - DELETE SUCCESS')
    );
  }

  private _updateDoc(type: string, id: string, doc: any): PromiseLike<any> {
    const index = '.portail';
    return this.client.update({
      index: index,
      type: type,
      id: id,
      body: {
        doc: doc
      }
    }).then(
      response => console.log('SUCCESS')
    );
  }
  public getIndexNumFields(index): any {
    return this.map(index).then(function (response) {
      const mappings = response[index].mappings;

      // this is beacause the mapping field is different for
      // each index, so we take the first field
      const props = mappings[Object.keys(mappings)[0]].properties;

      const numProps = [];
      for (const propName in props) {
        if (['integer', 'long', 'short', 'byte', 'double', 'float', 'half_float', 'scaled_float']
          .indexOf(props[propName].type) >= 0) {
          numProps.push(propName);
        }
      }
      return numProps;
    });
  }
  public getIndexDateFields(index): any {
    return this.map(index).then(function (response) {
      const mappings = response[index].mappings;

      // this is beacause the mapping field is different for
      // each index, so we take the first field
      const props = mappings[Object.keys(mappings)[0]].properties;

      const numProps = [];
      for (const propName in props) {
        if (['date', 'Date', 'date_time']
          .indexOf(props[propName].type) >= 0) {
          numProps.push(propName);
        }
      }
      return numProps;
    });
  }
  public getIndexTextFields(index): any {
    return this.map(index).then(function (response) {
      const mappings = response[index].mappings;

      // this is beacause the mapping field is different for
      // each index, so we take the first field
      const props = mappings[Object.keys(mappings)[0]].properties;

      const textProps = [];
      for (const propName in props) {
        if (['text', 'string'].indexOf(props[propName].type) >= 0) {
          textProps.push(propName);
        }
      }
      return textProps;
    });
  }
  private map(index): PromiseLike<any> {
    return this.client.indices.getMapping(
      {
        index: index
      }
    ).then(
      response => response
    );
  }
}

