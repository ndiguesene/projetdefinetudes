import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class MapService {

  constructor(private http: HttpClient) { }
  getDecodeAddress(adress: string) {
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBxN94mGOuGxOWMUsgNHDYm4GNHQJ4wfKg&address=' + adress);
  }
}
