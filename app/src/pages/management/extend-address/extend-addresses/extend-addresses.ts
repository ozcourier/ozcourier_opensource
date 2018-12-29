import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { WalkthroughPage } from '../../../walkthrough/walkthrough';
import { UserService } from '../../../../providers/user/index';
import { ExtendAddress, ExtendAddressesService } from '../../../../providers/util/index';
import { ExtendAddresseDetailPage } from '../extend-addresse-detail/extend-addresse-detail';
import { WalkThroughService } from '../../../../providers/util/index';

@Component({
  selector: 'page-extend-addresses',
  templateUrl: 'extend-addresses.html',
})
export class ExtendAddressesPage {

  public _searchKey: string = '';
  public _extendAddrs: ExtendAddress[] = [];
  public _isEditFlag: boolean = false;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private _userService: UserService,
    public _extendAddressesService: ExtendAddressesService,
    private _walkThroughService: WalkThroughService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ExtenAddressesPage');
    if (this._walkThroughService.getPageWalkThroughStatus('my address')){
      this.navCtrl.push(WalkthroughPage, {name: 'my address'});
    }
    this.preLoadData();
  }

  itemClicked(item) {
    this.navCtrl.push(ExtendAddresseDetailPage,{extendAddress: item});
  }

  itemDelete(item) {
    this._extendAddressesService.removeExtendAddr(item);
  }

  itemDuplicate(item) {
    this.navCtrl.push(ExtendAddresseDetailPage,{duplicateAddr: item});
  }

  onEdit() {
    this._isEditFlag = !this._isEditFlag;
  }

  onAdd() {
    this.navCtrl.push(ExtendAddresseDetailPage,{});
  }

  getSearchItems() {

    // Reset items back to all of the items
    this._extendAddrs = this._extendAddressesService.getExtendAddressList();

    // set val to the value of the ev target
    var val = this._searchKey;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this._extendAddrs = this._extendAddrs.filter((item) => {
        return (item.name.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  preLoadData() {
    //get the current city list
    console.log("preLoadData() called.");
    let user = this._userService.getLocalUser();
    
    //get all the street of the areas 
    if (user){
      this._extendAddrs = this._extendAddressesService.getExtendAddressList();
      console.log(this._extendAddrs);
      if (this._extendAddrs.length === 0) {
        console.log("come here");
        this._extendAddressesService.getExtendAddrsFromServer()
        .subscribe(
          data => {
            console.log("getExtendAddrsFromServer() return.", data);
            this._extendAddrs = this._extendAddressesService.getExtendAddressList();
          },
          error => {
        });
      }
    }
  }
}
