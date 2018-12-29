import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { UserService } from '../../../../providers/user/index';

@Component({
  selector: 'page-setting-options',
  templateUrl: 'setting-options.html',
})
export class SettingOptionsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private _userService: UserService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingOptionsPage');
    let user = this._userService.getLocalUser();
    if (user){
    }
  }

  ionViewWillLeave() {

    let user = this._userService.getLocalUser();
    if (user){
    }
  }

}
