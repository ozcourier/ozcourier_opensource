import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';

//ozcourier
import { LoginPage } from '../login/login';
import { HomePage } from '../home/home';
import { User, UserService, AuthenticationService } from '../../providers/user/index';
import { GeoIP } from '../../providers/job/index';
import { AddressDetail, AddressFunc } from '../../providers/util/index';

@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {

  _geoAddress: AddressDetail;
  _loading: boolean = false;

  //parameters
  _username: string = '';
  _password: string = '';
  _passwordConfirm: string = '';
  _firstName: string = '';
  _lastName: string = '';
  _email: string = '';


  constructor(public navCtrl: NavController, 
            public navParams: NavParams,
            private _alertCtrl: AlertController,
            private _userService: UserService,
            private _authenticationService: AuthenticationService,
            private _geoIP: GeoIP) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');

    this._geoAddress = new AddressDetail();
    AddressFunc.resetAddressDetail(this._geoAddress);    //set the address to zero

    this._geoIP.getLocalGEO()
      .subscribe(
        data => {
            console.log("GeoIP->getLocalGEO():",data);
            this._geoAddress = data;
        },
        error => {
          console.log("Can't get local GEO, can't register");
      });
  }

  onVerify() {
    if (this._username.trim().length < 5) {
      return {result: false, error:"username need be at least 5 charactors"};
    }
    if (this._password.trim().length < 5) {
      return {result: false, error:"password need be at least 5 charactors"};
    }
    if (this._password != this._passwordConfirm) {
      return {result: false, error:"password confirm failed, need to be the same"};
    }
    if (this._firstName.trim().length ==0) {
      return {result: false, error:"First name is required"};
    }
    if (this._email.trim().length ==0) {
      return {result: false, error:"Email is required"};
    }

    return {result: true, error:''};
  }

  register() {
    
    //veryfiy the form first
    let ret = this.onVerify();
    if (!ret.result) {
      let alert = this._alertCtrl.create({
        title: 'Error!',
        subTitle: ret.error,
        buttons: ['OK']
      });
      alert.present();
      return;
    }

    //creat the user
    let user: User = new User();
    user.username = this._username;
    user.password = this._password;
    user.userdetail = {firstname: this._firstName,
                      lastname: this._lastName,
                      emailaddress: this._email.trim().toLocaleLowerCase()};
    user.company = {  name: '',
                      country: this._geoAddress.country,
                      state: this._geoAddress.state,
                      city: this._geoAddress.city,
                      mapSetting: {lat: this._geoAddress.lat, 
                                  lng: this._geoAddress.lng, 
                                  zoom: 13},
                      areas:[{area: ''}]};
    user.settings = {parcelDescriptions: []};
    
    this._loading = true;
    console.log("RegisterPage->register():", user);
    this._userService.create(user)
        .subscribe(
            user => {
              this._userService.setIsUserFirstLogin(true);
              this._authenticationService.login(this._username, this._password)
                .subscribe(
                    data => {
                        console.log(data);
                        console.log(this._userService.getIsUserFirstLogin());

                        this._loading = false;
                        if (data.result){
                          this.navCtrl.setRoot(HomePage);
                        }
                        else {
                          this.navCtrl.push(LoginPage);
                        }
                });
            },
            error => {
                console.log(error);
                this._loading = false;
                let alert = this._alertCtrl.create({
                  title: 'Error!',
                  subTitle: error.error.error,
                  buttons: ['OK']
                });
                alert.present();
            });
  }

}
