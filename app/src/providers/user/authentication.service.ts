import { Injectable } from '@angular/core';
//import { Http, Headers, Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map'
import { Subject } from 'rxjs/Subject';
import { AppVersion } from '@ionic-native/app-version';
import { Platform } from 'ionic-angular';

import { AppConfig } from '../../app/app.config';
import { UserService } from '../user/index';

@Injectable()
export class AuthenticationService {
  private _ver : string = '';
  private _platformName: string = '';
  private _platforms = ['android', 'ios', 'core', 'windows'];
  private _userLoginStatusSubscriber = new Subject<any>();

  constructor(private http: HttpClient, private config: AppConfig, 
    private _userService:UserService,
    private _appVersion: AppVersion,
    private _platform: Platform) 
  { 
    this._appVersion.getVersionNumber().then((version) => {this._ver = version}).catch((err) => {});
    for (let ea of this._platforms) {
      if (this._platform.is(ea)) {
        this._platformName = ea;
        break;
      }
    }
  }

  sendNotify(msg: any) {
    this._userLoginStatusSubscriber.next(msg);
  }

  getNotify() {
    return this._userLoginStatusSubscriber.asObservable();
  }

  login(username: string, password: string) {
    var  _jobServiceSubscriber = new Subject<any>();

    console.log("platform:" + this._platformName + ", version:" + this._ver);
    
    this.http.post<any>(this.config.apiUrl + '/users/authenticate', 
      { username: username, password: password, platform: this._platformName, version: this._ver })
      .subscribe(
        user => {
          // login successful if there's a jwt token in the response
          //let user = response.json();
          if (user && user.token) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            this._userService.saveLocalUser(user);
            this._userService.UpdateLoginDate();
          }
          
          console.log("user login succ");
          _jobServiceSubscriber.next({result:true, cotent: user});
          this.sendNotify({status: 'logined'});
        },
        error => {
          console.log(error.error.error);
          _jobServiceSubscriber.next({result:false, cotent: error.error.error});
        }
      );

    return _jobServiceSubscriber;
  }

  resetPassword(id, oldpassword: string, newpassword: string) {
    var  _jobServiceSubscriber = new Subject<any>();
    this.http.post<any>(this.config.apiUrl + '/users/pwdreset/'+id, { oldpassword: oldpassword, newpassword: newpassword }, this._userService.jwt())
    .subscribe(user => {
      // login successful if there's a jwt token in the response
      //let user = response.json();
      if (user && user.token) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        this._userService.saveLocalUser(user);
      }
      _jobServiceSubscriber.next({result:true, cotent: user});
    },
    error => {
      console.log(error.error.error);
      _jobServiceSubscriber.next({result:false, cotent: error.error.error});
    });

    return _jobServiceSubscriber;
  }

  logout() {
    // remove user from local storage to log user out
    console.log("user logout");
    this._userService.clearLocalUser();
    this.sendNotify({status: 'login out'});
  }
}