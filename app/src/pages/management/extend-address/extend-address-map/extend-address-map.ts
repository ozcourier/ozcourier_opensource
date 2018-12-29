import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker
} from '@ionic-native/google-maps';
import { Observable } from 'rxjs/Observable';

import { UserService } from '../../../../providers/user/index';
import { GeoIP } from '../../../../providers/job/index';
import { Address } from '../../../../providers/util/index';
import { ExtendAddress } from '../../../../providers/util/index';

declare var google: any;

@Component({
  selector: 'page-extend-address-map',
  templateUrl: 'extend-address-map.html',
})
export class ExtendAddressMapPage {
  public _extendAddr: ExtendAddress = null;
  public _addr: string = '';
  public _lat: Number = 0;
  public _lng: Number = 0;
  map: GoogleMap;
  mapReady: boolean = false;
  jobMarker: Marker = null;
  iconUrl: string = 'assets/icon/delivery_open.png';

  _setGeoMarker: any = null;
  _defaultZoom: Number = 13;

  //google address auto complete
  @ViewChild('searchbar', { read: ElementRef }) searchbar: ElementRef;
  addressElement: HTMLInputElement = null;
  autocomplete: any;
  autoCompletAddr: Address = null;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private _userService: UserService,
    public _geoIP: GeoIP,) {

    this._extendAddr = navParams.get("extendAddress");
    if (this._extendAddr){
      console.log(this._extendAddr);
      this._lat = this._extendAddr.lat;
      this._lng = this._extendAddr.lng;
    }
    else{
      console.log("extend-address-map should have parameters. will quit!");
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExtendAddressMapPage');

    if (!this._extendAddr) {
      this.navCtrl.pop();
    }

    this.loadMap();
    this.initAutocomplete();
  }

  dismiss() {
    this.navCtrl.pop();
  }


  initAutocomplete(): void {
    // reference : https://github.com/driftyco/ionic/issues/7223
    this.addressElement = this.searchbar.nativeElement.querySelector('.searchbar-input');
    this.createAutocomplete(this.addressElement).subscribe((location) => {
      console.log('Searchdata', location);
      this.autoCompletAddr = location;
      //
      this._lat = location.lat;
      this._lng = location.lng;
      this.updateJobMarker({lat: Number(this._lat), lng: Number(this._lng)});
      if (this.mapReady){
        //set to center position
        this.map.setCameraTarget({"lat": Number(this._lat), "lng": Number(this._lng)});
      }
    });
  }

  createAutocomplete(addressEl: HTMLInputElement): Observable<any> {
    var user = this._userService.getLocalUser();

    var circle = new google.maps.Circle({
      center: { lat: user.company.mapSetting.lat, lng: user.company.mapSetting.lng},
      radius: 5000
    });
    var options = {
      bounds: circle.getBounds(),
    };
    this.autocomplete = new google.maps.places.Autocomplete(addressEl, options);
    
    return new Observable((sub: any) => {
      google.maps.event.addListener(this.autocomplete, 'place_changed', () => {
        const place = this.autocomplete.getPlace();
        if (!place.geometry || !place.formatted_address) {
          sub.error({
            message: 'Autocomplete returned place with no geometry'
          });
        } else {
          console.log('Search Lat', place.geometry.location.lat());
          console.log('Search Lng', place.geometry.location.lng());
          sub.next({faddr: place.formatted_address, 
            addr: place.name ? place.name: '',
            city: place.vicinity ? place.vicinity: '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()});
        }
      });
    });
  }

  updateJobMarker(position) {
    if (!this.mapReady){
      return;
    }

    if (this.jobMarker) {
      console.log("update marker "  + position.lat + ':' + position.lng);
      this.jobMarker.setPosition({lat: position.lat, lng: position.lng});
    }
    else {
      console.log("add marker " + position.lat + ':' + position.lng);
      this.map.addMarker({
        title: this._extendAddr.name,
        position: {lat: position.lat, lng: position.lng},
        icon: { url : this.iconUrl},
      }).then ((marker: Marker) => {
        this.jobMarker = marker;
      });
    }

    this._setGeoMarker = position;
  }

  loadMap() {
    let user = this._userService.getLocalUser();
    if (!user) {
      return;
    }

    var centerLat = user.company.mapSetting.lat;
    var centerlng = user.company.mapSetting.lng;
    var defaultZoom = Number(user.company.mapSetting.zoom);
    if ((0 != this._lat) && (0 != this._lng)) {
      centerLat =  this._lat;
      centerlng =  this._lng;
      defaultZoom = 18;
    }

    this.map = GoogleMaps.create('map_extend_add_geo_canvas', {
      controls: {
        compass: false,
        myLocationButton: false,
        indoorPicker: false,
        zoom: true
      },
      camera: {
        target: {
          lat: centerLat,
          lng: centerlng
        },
        zoom: defaultZoom,
      }
    });

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      console.log('map is ready to use');
      this.mapReady = true;

      if ((0 != this._lat) && (0 != this._lng)) {
        //show the job's current lat:lng
        this.updateJobMarker({lat: Number(this._lat), lng: Number(this._lng)});
      }

      this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe((data) => {
        console.log(data);
        if (data.length > 0){
          this.updateJobMarker({lat: data[0].lat, lng: data[0].lng});
        }
      });
    });
  }

  onConfirm() {
    //need to confirm both the marker and markgeo ok, for to avoid the addMarker() return too later
    if (this.jobMarker && this._setGeoMarker) {
      this._extendAddr.lat = this._geoIP.latLonFixed(this._setGeoMarker.lat);
      this._extendAddr.lng = this._geoIP.latLonFixed(this._setGeoMarker.lng);

      this.navCtrl.pop();
    }
    else {

    }
  }

}
