import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule }  from '@angular/common'
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Geocoder, GoogleMaps } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
//import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IonicStorageModule } from '@ionic/storage';
import { AppVersion } from '@ionic-native/app-version';
import { InAppPurchase } from '@ionic-native/in-app-purchase';
import { File } from '@ionic-native/file';
import { Diagnostic } from '@ionic-native/diagnostic';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

//ozcourier
import { MyApp } from './app.component';
import { AppConfig } from './app.config'

//providers
import { JobsModule } from '../providers/job/jobs.module';
import { UsersModule } from '../providers/user/users.module';
import { UtilModule } from '../providers/util/util.module';

import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { WalkthroughPage } from '../pages/walkthrough/walkthrough';
//job pages
import { JobPageModule } from '../pages/job/job-page.module';
//management pages
import { ManagementModule } from '../pages/management/management.module';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    WalkthroughPage,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule,
    AngularFontAwesomeModule,
    UsersModule,
    JobsModule,
    UtilModule,
    JobPageModule,
    ManagementModule,
    IonicModule.forRoot(MyApp,{
      //tabsHideOnSubPages: true,
    }),
    IonicStorageModule.forRoot({
      name: 'ozcourier',
      storeName: 'ozcourierdb',
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    RegisterPage,
    WalkthroughPage,
  ],
  providers: [
    Geocoder,
    GoogleMaps,
    Geolocation,
    AppConfig,
    //StatusBar,
    SplashScreen,
    AppVersion,
    InAppPurchase,
    File,
    Diagnostic,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ],
})
export class AppModule {}
