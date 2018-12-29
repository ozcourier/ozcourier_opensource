import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { UserService } from '../../../../providers/user/index';
import { ResetPasswordPage } from '../reset-password/reset-password';

/**
 * Generated class for the ForgotPasswordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
  public _email: string = '';

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private toastCtrl: ToastController,
    public _userService: UserService) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad ForgotPasswordPage');
  }

  onResetPassword(){
    if ('' == this._email.trim()){
      let toast = this.toastCtrl.create({
        message: 'Please input your email address',
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      return;
    }

    this._userService.forgotPassword(this._email.trim().toLocaleLowerCase())
    .subscribe(
      data => {
        console.log(data);

        let toast = this.toastCtrl.create({
          message:  data['info'],
          duration: 3000,
          position: 'bottom'
        });
        toast.present();

        this.navCtrl.push(ResetPasswordPage, {email: this._email});
      },
      error => {
          console.log(error);
          let toast = this.toastCtrl.create({
            message: JSON.stringify(error),
            duration: 3000,
            position: 'bottom'
          });
          toast.present();
      });
  }

  onHaveVerifyCode(){
    this.navCtrl.push(ResetPasswordPage, {email: this._email});
  }

}
