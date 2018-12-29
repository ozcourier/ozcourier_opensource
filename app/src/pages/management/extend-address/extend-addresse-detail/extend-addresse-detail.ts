import { Component} from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { UserService } from '../../../../providers/user/index';
import { ExtendAddress, ExtendAddressesService } from '../../../../providers/util/index';
import { ExtendAddressMapPage } from '../extend-address-map/extend-address-map';


@Component({
  selector: 'page-extend-addresse-detail',
  templateUrl: 'extend-addresse-detail.html',
})
export class ExtendAddresseDetailPage {

  public _extendAddr: ExtendAddress = null;
  public _newExAddr: ExtendAddress = null;
  public _city: string = '';

  public _isShowAddrList: boolean = false;
  public _matchedStreet = [];

  public citylist=[];
  public curcitylist=[];
  public _isShowCityList: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private toastCtrl: ToastController,
    private _userService: UserService,
    private _extendAddressesService: ExtendAddressesService) {

    //initialize newAddr
    this.initNewAddr();

    this._extendAddr = navParams.get("extendAddress");
    if (this._extendAddr){
      console.log(this._extendAddr);
      this.copyAddr(this._newExAddr, this._extendAddr);

    }

    //if duplicate param exists
    let duplicateAddr = navParams.get("duplicateAddr");
    if (duplicateAddr){
      this.copyAddr(this._newExAddr, duplicateAddr);
      this._newExAddr._id = this._extendAddressesService.createRadomNewId();//use it temporary
      this._newExAddr.name = '';
      this._newExAddr.notes = '';
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExtenAddresseDetailPage');
  }

  ionViewWillLeave() {
    this.onUpdate();
  }

  dismiss() {
    this.navCtrl.pop();
  }

  copyAddr(dst: ExtendAddress, src: ExtendAddress) {
    dst._id = src._id;
    dst.driver_id = src.driver_id;
    dst.name = src.name;
    dst.notes = src.notes;
    dst.lat = src.lat;
    dst.lng = src.lng;
  }

  initNewAddr(){
    this._newExAddr = new ExtendAddress();
    this._newExAddr._id = this._extendAddressesService.createRadomNewId();//String(this._addedJobList.length+1); //use it temporary
    this._newExAddr.driver_id = this._userService.getLocalUserId();
    this._newExAddr.name = '';
    this._newExAddr.notes = '';
    this._newExAddr.lat = 0;
    this._newExAddr.lng = 0;
  }

  getFieldValues(addr: ExtendAddress) {
    addr.name = this._newExAddr.name;
    //addr.address.city = this._newExAddr.address.city;
    addr.notes = this._newExAddr.notes;
    addr.lat = this._newExAddr.lat;
    addr.lng = this._newExAddr.lng;
  }

  onUpdate() {
    
    if (this._extendAddr) {
      this.getFieldValues(this._extendAddr);
      this._extendAddressesService.updateExtendAddress(this._extendAddr);
    }
  }

  public onAdd(){
    console.log("Extend address add: " + this._newExAddr);

    //validator check
    if ("" === this._newExAddr.name){
      let toast = this.toastCtrl.create({
        message: "The name can't be empty",
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      return;
    }

    if ((0 == this._newExAddr.lat) && (0 == this._newExAddr.lng)){
      let toast = this.toastCtrl.create({
        message: "Please set GEO on map",
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      return;
    }

    this._extendAddressesService.addExtendAddr(this._newExAddr);
    this.navCtrl.pop();
  }

  onSetGEO() {
    this.navCtrl.push(ExtendAddressMapPage,{extendAddress: this._newExAddr});
  }

}
