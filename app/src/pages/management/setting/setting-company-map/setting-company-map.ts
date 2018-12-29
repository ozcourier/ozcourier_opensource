import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, Platform, ToastController } from 'ionic-angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
} from '@ionic-native/google-maps';

import { UserService } from '../../../../providers/user/index';

@Component({
  selector: 'page-setting-company-map',
  templateUrl: 'setting-company-map.html',
})
export class SettingCompanyMapPage {
  map: GoogleMap;
  mapReady: boolean = false;
  centerMarker: Marker = null;
  tabBarElement: any;
  @ViewChild(Content) content: Content;
  public topOrBottom: any;
  public tabBarHeight: any;
  contentBox: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private _userService: UserService,
    private _platform: Platform,
    private toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingCompanyMapPage');
    this._platform.ready().then(() => {
      this.loadMap();
    });
  }

  ionViewWillEnter() {
    //for ionic bug: can't hide the tab when using the map canvas : hide the tab
    this.content.resize();
  }

  ionViewWillLeave() {
    this.onUpdate();
    let toast = this.toastCtrl.create({
      message: "The map setting is updated, it'll affect after you restart the App.",
      duration: 5000,
      position: 'bottom'
    });
  
    toast.present();    
  }

  loadMap() {
    let user = this._userService.getLocalUser();
    if (!user) {
      console.log("loadMap() failed, can't get the user");
      return;
    }

    this.map = GoogleMaps.create('map_canvas_company', {
      controls: {
        compass: false,
        myLocationButton: false,
        indoorPicker: false,
        zoom: true
      },
      camera: {
        target: {
          lat: user.company.mapSetting.lat,
          lng: user.company.mapSetting.lng
        },
        zoom: Number(user.company.mapSetting.zoom),
        tilt: 30
      }
    });

    console.log("map created");
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      console.log('map is ready to use');
      this.mapReady = true;

      this.map.addMarker({
        position: this.map.getCameraTarget(),
        icon: { url : 'assets/icon/star.png'},
      }).then((marker: Marker) => {
        this.centerMarker = marker;
      });

      this.map.on(GoogleMapsEvent.CAMERA_MOVE).subscribe(() => {
        //this.zone.run(() => this.onShowHideClick());
        if (this.centerMarker) {
          this.centerMarker.setPosition(this.map.getCameraTarget());
        }
      });
    });
  }

  onUpdate() {
    if (!this.mapReady) {
      return;
    }
    try {
      let center = this.map.getCameraTarget();
      let zoom = (Math.floor(this.map.getCameraZoom()*10))/10;
      console.log(center.lat + ":" + center.lng + "-" + zoom);
      var mapSetting = {
        lat: center.lat,
        lng: center.lng,
        zoom: zoom,
      };
  
      this._userService.updateMapSetting(mapSetting)
        .subscribe(
          data => {
              this._userService.syncUserFromDB();
  
          },
          error => {
          });
    }
    catch (e){
      console.log(e);
    }
  }
}
