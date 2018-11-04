import { Injectable } from '@angular/core';
import PNotify from 'pnotify/dist/es/PNotify';
import PNotifyButtons from 'pnotify/dist/es/PNotifyButtons';

@Injectable()
export class PnotifyService {

  constructor() { }
  getPNotify() {
    // tslint:disable-next-line:no-unused-expression
    PNotifyButtons; // Initiate the module. Important!
    PNotify.defaults.styling = 'bootstrap4'; // Bootstrap version 4
    PNotify.defaults.icons = 'fontawesome4'; // Font Awesome 4
    PNotify.defaults.width = '400px';
    return PNotify;
  }

}
