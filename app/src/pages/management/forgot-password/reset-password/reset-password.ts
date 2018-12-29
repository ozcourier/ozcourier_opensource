import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { UserService } from '../../../../providers/user/index';
import { LoginPage } from '../../../login/login';


@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {
  public _email: string = '';
  public _token: string = '';
  public _password: string = '';
  public _confirmPassword: string = '';

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private toastCtrl: ToastController,
    public _userService: UserService) {

    let email = navParams.get('email');
    if (email){
      this._email = email;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ResetPasswordPage');
  }

  onReset(){
    if ('' == this._email.trim()){
      let toast = this.toastCtrl.create({
        message:   'Please input email address',
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      return;
    }
    if (this._password != this._confirmPassword){
      let toast = this.toastCtrl.create({
        message:  'The confirm password is not match with the new password',
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      return;
    }

    this._userService.resetPassword(this._email.trim().toLocaleLowerCase(), this._token, this._password)
    .subscribe(
      user => {
        console.log(user);
        let toast = this.toastCtrl.create({
          message:  'Password reseted, please try to login',
          duration: 3000,
          position: 'bottom'
        });
        toast.present();
        this.navCtrl.push(LoginPage);
      },
      error => {
          console.log(error);
          let toast = this.toastCtrl.create({
            message:  JSON.stringify(error),
            duration: 3000,
            position: 'bottom'
          });
          toast.present();
      });
  }
}
