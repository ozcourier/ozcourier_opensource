import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { User, UserService, AuthenticationService } from '../../../../providers/user/index';

@Component({
  selector: 'page-setting-reset-password',
  templateUrl: 'setting-reset-password.html',
})
export class SettingResetPasswordPage {
  _localUser: User;
  _oldPassword: string = '';
  _newPassword: string = '';
  _newPasswordConfirm: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private toastCtrl: ToastController,
    private _userService: UserService,
    private _authenticationService: AuthenticationService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingResetPasswordPage');
    this._localUser = this._userService.getLocalUser();
  }

  alert(title, contnet){
    let toast = this.toastCtrl.create({
      message:  contnet,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }
  
  onPasswordReset() {
    console.log(this._oldPassword, this._newPassword, this._newPasswordConfirm);
    if ('' === this._oldPassword)
    {
      this.alert('error!', "Must input the old password");
      return;
    }
    if ('' === this._newPassword ){
      this.alert('error!', "Must input the new password");
      return;
    }
    if (this._newPassword !== this._newPasswordConfirm){
      this.alert('error!', "The new password don't equal to the password confirm, please check them");
      return;
    }

    //update password to server, the server will verify the old password
    this._authenticationService.resetPassword(this._localUser._id, this._oldPassword, this._newPassword)
      .subscribe(
        data => {
          if (data){
            if (data.result) {
              this.alert('Success', "Password reset successful");              
            }
            else{
              this.alert('error!', data.cotent);
            }
          }
        });
  }
}
