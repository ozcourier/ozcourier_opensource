import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  public _appName: string = '';
  public _packageName: string = '';
  public _verCode: string = '';
  public _ver: string = '';
  public _expireDate =  '';

  constructor(public navCtrl: NavController, private appVersion: AppVersion) {
  }

  ionViewDidLoad() {
    this.appVersion.getAppName()
      .then((name) => {this._appName = name})
      .catch((err) => {});
    this.appVersion.getPackageName().then((name) => {this._packageName = name}).catch((err) => {});;
    this.appVersion.getVersionCode().then((code) => {this._verCode = code}).catch((err) => {});;
    this.appVersion.getVersionNumber().then((ver) => {this._ver = ver}).catch((err) => {});;
  }

}
