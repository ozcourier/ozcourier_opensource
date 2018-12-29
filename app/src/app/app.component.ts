import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
//import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {Observable} from "rxjs/Observable";
import 'rxjs/add/observable/interval'

import { AuthGuard } from '../providers/user/index';
import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';

import { AuthenticationService, UserService } from '../providers/user/index';

import { AboutPage } from '../pages/management/setting/about/about';
import { JobHistoryPage } from '../pages/management/job-history/job-history';
import { SettingPage } from '../pages/management/setting/setting';
import { JobListPage } from '../pages/job/job-list/job-list';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage:any = LoginPage;
  pages: Array<{title: string, component: any, icon: string, color: string}>;
  //jobPages: Array<{title: string, component: any, icon: string, color: string}>;
  
  public  _userName = '';
  public  _userEmail = '';


  constructor(
    public platform: Platform,
    //public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    private _authGuard: AuthGuard,
    private _authenticationService: AuthenticationService,
    private _userService: UserService) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      {title: "Job List", component: JobListPage, icon:'list-ul', color:''},
      {title: "Job History", component: JobHistoryPage, icon:'history', color:''},
      {title: "Settings", component: SettingPage, icon:'setting', color:''},

      { title: 'About', component: AboutPage, icon:'', color:'' },
      { title: 'Logout', component: LoginPage, icon:'', color:'' },
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //this.statusBar.styleDefault();

      if (this._authGuard.isLogined()){
        this.getUserProfile();

        //default set to tabs page
        this.rootPage = HomePage;

        //check echo to verify the authenicate token works or not?
        this._userService.getEcho()
        .subscribe(
          data => {
            console.log("send echo success");
          },
          error => {
            console.log(error);
            if (error){
              if ('status' in error){
                if (401 == error.status){
                  this.rootPage = LoginPage;
                }
              }
            }
          });
      }
      else {
        this.rootPage = LoginPage;
      }

      this.splashScreen.hide();

      this._authenticationService.getNotify().subscribe(
        msg => {
          //user maybe login or logout, need to update user information
          this.getUserProfile();
      });
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    //this.nav.setRoot(page.component);
    this.nav.push(page.component);
    if ('Logout' == page.title) {
      //set no router back
      this.splashScreen.show();
      this._authenticationService.logout();
      this.nav.setRoot(page.component).then(() => {
        window.location.reload();
        Observable.interval(5000).subscribe(() => {this.splashScreen.hide();});
      });
    }
  }

  getUserProfile() {
    this._userName = '';
    this._userEmail = '';
    let user = this._userService.getLocalUser();
    console.log(user);
    if (user){
      this._userName = user.userdetail.firstname + ' ' + user.userdetail.lastname;
      this._userEmail = user.userdetail.emailaddress;
    }
  }

  menuClosed(){
    //console.log("menu Closed");
  }

  menuOpened() {
    console.log("menu Opened");
    this.getUserProfile();
  }

}
