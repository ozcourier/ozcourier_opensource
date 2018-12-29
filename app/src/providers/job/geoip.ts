import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Platform } from 'ionic-angular';
import { Geocoder, GeocoderResult, BaseArrayClass } from '@ionic-native/google-maps';
import {Observable} from "rxjs/Observable";
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';


import { AppConfig } from '../../app/app.config';
import { AddressDetail, AddressFunc } from '../util/index';
//import { Street } from './streets';

@Injectable()
export class GeoIP {

    public watch: any;  
    public _lat : Number = 0;
    public _lon : Number = 0;

    constructor(private http: HttpClient, 
        public platform: Platform,
        private config: AppConfig, 
        public zone: NgZone) {
     }

    getLocalGEO() {
        //console.log("GeoIP->getLocalGEO():");
        var  _jobServiceSubscriber = new Subject<any>();
        this.http.get<any>(this.config.geoipUrl, {})
            .subscribe(geoip => {
                //let geoip = response.json();
                if (geoip){

                    var localGEO : AddressDetail;

                    localGEO = new AddressDetail();
                    AddressFunc.resetAddressDetail(localGEO);
                   
                    if (geoip.country_name){
                        localGEO.country = geoip.country_name;
                    }
                    if (geoip.region_name){
                        localGEO.state = geoip.region_code;//geoip.region_name;
                    }
                    if (geoip.city){
                        localGEO.city = geoip.city;
                    }
                    if (geoip.latitude) {
                        localGEO.lat = geoip.latitude;
                    }
                    if (geoip.longitude) {
                        localGEO.lng = geoip.longitude;
                    }                    
                }
                //console.log("GeoIP->getLocalGEO():",geoip);
                _jobServiceSubscriber.next(localGEO);
                //return localGEO;
            });

        return _jobServiceSubscriber;
    }

    getCurrentPosition(): Observable<any> {

        var geoLocationOptions = { timeout: 10000 };
        console.log(navigator);
   
        return new Observable<any>((responseObserver: Observer<any>) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        responseObserver.next(position);
                        responseObserver.complete();
                    },
                    (evt) => responseObserver.error(evt),
                    geoLocationOptions
                );
            } else {
                responseObserver.error('Browser Geolocation service failed.');
            }
        });
    }

    latLonFixed(latlon) {
        return parseFloat(latlon.toFixed(7));
    }

    getGeocodingWindows(address: string) {
        return Observable.create(observer => {
            observer.error("Don't support windows to call getGeocoding");
            observer.complete();
        });
    }

    getGeocodingAndroid(address: string) {
        return Observable.create(observer => {
        try {
            Geocoder.geocode({
            "address": [address]
          }).then((mvcArray: BaseArrayClass<GeocoderResult>) => {
            
                  mvcArray.one('finish').then(() => {
                    console.log('finish', mvcArray.getArray());
                    mvcArray.mapAsync((result: GeocoderResult) => {
                      if (!result) {
                        // Geocoder can not get the result
                        observer.next(null);
                        observer.complete();
                      }
                      console.log(result);
                      observer.next({
                          lat: result[0].position.lat, 
                          lng: result[0].position.lng});
                      observer.complete();
                    });
                  })
            
                });
        } catch (error) {
            observer.error('error getGeocoding' + error);
            observer.complete();
        }
        });
    }

    getGeocoding(address: string) {
        //console.log("core " + this.platform.is("core"));
        //console.log("windows " + this.platform.is('windows'));
        //console.log("android " + this.platform.is('android'));
        //console.log("IOS " + this.platform.is('ios'));
        if (this.platform.is("core")) {
            console.log("calling windows getGeoCodingWindows()");
            return this.getGeocodingWindows(address);
        }
        else {
            console.log("calling android getGeoCodingAndroid()");
            return this.getGeocodingAndroid(address);
        }
    }

    getGeocoding2_not_working(address: string) {
        return Observable.create(observer => {
        try {
            Geocoder.geocode({
            "address": [address]
          }).then ((results: GeocoderResult[]) =>{
              console.log("Geocoder.geocode() get result");
              console.log(results.length);
              if (results[0]) {
                console.log("1:" + results[0]);
              }

              console.log("2:" + results[0].position.lat);
              
              //const place = results[0].position;
              //console.log("place is:" + place);
              observer.next(results);
              observer.complete();

           });
        } catch (error) {
            observer.error('error getGeocoding' + error);
            observer.complete();
        }
        });
    }

    isGeoCoderValid(lat, lng) {
        return (0 !== lat && 0 !== lng);
    }

}