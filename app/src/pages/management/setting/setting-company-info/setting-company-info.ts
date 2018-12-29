import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { User, UserService } from '../../../../providers/user/index';
import { LogsService } from '../../../../providers/util/index'


@Component({
  selector: 'page-setting-company-info',
  templateUrl: 'setting-company-info.html',
})
export class SettingCompanyInfoPage {

  _localUser: User;
  _companyName: string = '';
  _city: string = '';
  _state: string = '';
  _country: string = '';
  isWizard: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private _userService: UserService, private _logsService: LogsService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingCompanyInfoPage');
    this._localUser = this._userService.getLocalUser();
    this._companyName = this._localUser.company.name;
    this._city = this._localUser.company.city;
    this._state = this._localUser.company.state;
    this._country = this._localUser.company.country;
  }

  ionViewWillLeave() {
    this.onUpdate();
  }

  onUpdate() {
    
    if ((this._localUser.company.name === this._companyName) &&
    (this._localUser.company.city === this._city) &&
    (this._localUser.company.state === this._state) &&
    (this._localUser.company.country === this._country)){
      return;
    }

    this._localUser.company.name = this._companyName;
    this._localUser.company.city = this._city;
    this._localUser.company.state = this._state;
    this._localUser.company.country = this._country;
    this._userService.update(this._localUser)
      .subscribe(
        data => {
          this._logsService.log("success","Company information update successful");
          this._userService.syncUserFromDB();  //need to sync with db
        },
        error => {
          this._logsService.log("error", "Company information update failed" + error.error.error);
        });
    }

  public wizardCommit() {
    this.onUpdate();
  }
}
