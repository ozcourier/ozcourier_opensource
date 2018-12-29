import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AlertController, App } from 'ionic-angular';

//ozcourier 
import { AuthenticationService, UserService } from '../../providers/user/index';
import { HomePage } from '../home/home';
import { RegisterPage } from '../register/register';
import { ExtendAddressesService } from '../../providers/util/index';
import { ForgotPasswordPage } from '../management/forgot-password/forgot-password/forgot-password';
import { AddressDetail } from '../../providers/util/index';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  _loading = false;
  _geoAddress: AddressDetail;
  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public appCtrl: App,
    private _authenticationService: AuthenticationService,
    private _userService: UserService,
    private _extendAddressesService: ExtendAddressesService,
    private _alertCtrl: AlertController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  logIn(username: HTMLInputElement, password: HTMLInputElement) {
    this._loading = true;
    this._authenticationService.login(username.value, password.value)
        .subscribe(
            data => {
                console.log(data);
                if (data.result){
                  console.log(this._userService.getIsUserFirstLogin());

                  //login success, need to clear some old data
                  this._extendAddressesService.clearLocalStorage();

                  //this.navCtrl.push(HomePage);
                  this.navCtrl.setRoot(HomePage);
                }
                else {
                  let alert = this._alertCtrl.create({
                    title: 'Error!',
                    subTitle: data.cotent,
                    buttons: ['OK']
                  });
                  alert.present();
                }
        });
  }

  onRegister() {
    this.navCtrl.push(RegisterPage);
  }

  onForgot() {
    this.navCtrl.push(ForgotPasswordPage);
  }

}
