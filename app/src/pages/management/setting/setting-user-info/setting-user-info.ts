import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { User, UserService } from '../../../../providers/user/index';
import { LogsService } from '../../../../providers/util/index'

@Component({
  selector: 'page-setting-user-info',
  templateUrl: 'setting-user-info.html',
})
export class SettingUserInfoPage {
  _localUser: User;
  _userName: string = '';
  _firstName: string = '';
  _lastName: string = '';
  _email: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams,
            private _userService: UserService, private _logsService: LogsService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingUserInfoPage');
    this._localUser = this._userService.getLocalUser();
    this._userName = this._localUser.username;
    this._firstName = this._localUser.userdetail.firstname;
    this._lastName = this._localUser.userdetail.lastname;
    this._email = this._localUser.userdetail.emailaddress;
  }

  ionViewWillLeave() {
    this.onUpdate();
  }

  onUpdate() {

    if ((this._localUser.userdetail.firstname === this._firstName) &&
    (this._localUser.userdetail.lastname === this._lastName) &&
    (this._localUser.userdetail.emailaddress === this._email.toLocaleLowerCase())) {
      return;
    }
    
    this._localUser.userdetail.firstname = this._firstName;
    this._localUser.userdetail.lastname = this._lastName;
    this._localUser.userdetail.emailaddress = this._email.trim().toLocaleLowerCase();
    this._userService.update(this._localUser)
      .subscribe(
        () => {
          this._logsService.log('success', "User information update successful");
          this._userService.syncUserFromDB();  //need to sync with db
        },
        error => {
          this._logsService.log('error', error.error.error);
        });
  }
}
