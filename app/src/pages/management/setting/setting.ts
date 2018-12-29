import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { App } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import {Observable} from "rxjs/Observable";
import 'rxjs/add/observable/interval'


import { LoginPage } from '../../login/login';
import { SettingUserInfoPage } from '../setting/setting-user-info/setting-user-info';
import { SettingResetPasswordPage } from '../setting/setting-reset-password/setting-reset-password';
import { ExtendAddressesPage } from '../extend-address/extend-addresses/extend-addresses';
import { SettingCompanyMapPage } from '../setting/setting-company-map/setting-company-map';
import { ParcelDescriptionsPage } from './parcel-descriptions/parcel-descriptions';

import { AboutPage } from './about/about';
import { JobHistoryPage } from '../job-history/job-history';

import { LogsPage } from '../logs/logs';
import { LogsService } from '../../../providers/util/index';

@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {

  public _userActions: any = [
    {name: 'User Profile', childPage:SettingUserInfoPage},
    {name: 'Reset Password', childPage:SettingResetPasswordPage},
    ];

  public _settingActions: any = [
    //{name: 'Company Profile', childPage:SettingCompanyInfoPage},
    {name: 'Map Setting', childPage: SettingCompanyMapPage},
    {name: 'My Addresses', childPage: ExtendAddressesPage},
    {name: 'Parcel Descriptions', childPage: ParcelDescriptionsPage},
  ];

  public _OtherActions: any = [
    {name: "Job History", childPage: JobHistoryPage},
    {name: 'About', childPage:AboutPage},
    {name: 'Logout', childPage:LoginPage}];


    public _DebugActions: any = [{name: 'Logs', childPage:LogsPage}
                              ]
                            
                              

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public splashScreen: SplashScreen,
    public appCtrl: App,
    public _logsService: LogsService) {
  }

  ionViewDidLoad() {
  }

  onUserActionClick(action) {
    console.log("onUserActionClick() called:" + action);
    if ('' != action.childPage) {
      this.navCtrl.push(action.childPage);
    }
  }

  onSettingActionClick(action) {
    console.log("onUserActionClick() called:" + action);
    if ('' != action.childPage) {
      this.navCtrl.push(action.childPage);
      //this.appCtrl.getRootNav().push(action.childPage);
    }
  }

  onOtherActionClick(action) {
    console.log("onUserActionClick() called:" + action);
    if ('' != action.childPage) {
      this.navCtrl.push(action.childPage);
      if ('Logout' == action.name) {
        //set no router back
        this.splashScreen.show();
        this.navCtrl.setRoot(action.childPage).then(() => {
          window.location.reload();
          Observable.interval(5000).subscribe(() => {this.splashScreen.hide();});
        });
    }}
  }

  onDebugActionClick(action) {
    console.log("onDebugActionClick() called:" + action.name);
    if ('' != action.childPage) {
      this.navCtrl.push(action.childPage);
    }
  }

}
