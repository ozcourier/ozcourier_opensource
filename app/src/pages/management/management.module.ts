import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule }  from '@angular/common';

import { SettingPage } from './setting/setting';
import { SettingUserInfoPage } from './setting/setting-user-info/setting-user-info';
import { SettingResetPasswordPage } from './setting/setting-reset-password/setting-reset-password';
import { SettingCompanyInfoPage } from './setting/setting-company-info/setting-company-info';
import { SettingCompanyMapPage } from './setting/setting-company-map/setting-company-map';
import { AboutPage } from './setting/about/about';
import { SettingOptionsPage } from './setting/setting-options/setting-options';

//for other
import { JobHistoryPage } from './job-history/job-history';
import { LogsPage } from './logs/logs';
import { ExtendAddressesPage } from './extend-address/extend-addresses/extend-addresses';
import { ExtendAddresseDetailPage } from './extend-address/extend-addresse-detail/extend-addresse-detail';
import { ExtendAddressMapPage } from './extend-address/extend-address-map/extend-address-map';
import { ForgotPasswordPage } from './forgot-password/forgot-password/forgot-password';
import { ResetPasswordPage } from './forgot-password/reset-password/reset-password';
import { ParcelDescriptionsPage } from './setting/parcel-descriptions/parcel-descriptions';

@NgModule({
  declarations: [
    SettingPage,
    SettingUserInfoPage,
    SettingResetPasswordPage,
    SettingCompanyInfoPage,
    SettingCompanyMapPage,
    AboutPage,
    LogsPage,
    JobHistoryPage,
    ExtendAddressesPage,
    ExtendAddresseDetailPage,
    ExtendAddressMapPage,
    ForgotPasswordPage,
    ResetPasswordPage,
    SettingOptionsPage,
    ParcelDescriptionsPage
  ],
  entryComponents: [
    SettingPage,
    SettingUserInfoPage,
    SettingResetPasswordPage,
    SettingCompanyInfoPage,
    SettingCompanyMapPage,
    AboutPage,
    LogsPage,
    JobHistoryPage,
    ExtendAddressesPage,
    ExtendAddresseDetailPage,
    ExtendAddressMapPage,
    ForgotPasswordPage,
    ResetPasswordPage,
    SettingOptionsPage,
    ParcelDescriptionsPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule,
    IonicPageModule.forChild(SettingPage),
  ],
})
export class ManagementModule {}
