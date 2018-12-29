import { Component } from '@angular/core';
import { NavController, NavParams, reorderArray } from 'ionic-angular';

import { User, UserService } from '../../../../providers/user/index';

/**
 * Generated class for the ParcelDescriptionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-parcel-descriptions',
  templateUrl: 'parcel-descriptions.html',
})
export class ParcelDescriptionsPage {

  public items : Array<string> = [];

  public _newType = '';
  public _localUser: User;
  public _isChanged = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private _userService: UserService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ParcelDescriptionsPage');
    this._localUser = this._userService.getLocalUser();
    this.items = this._localUser.settings.parcelDescriptions;
    console.log(this._localUser);
    console.log(this.items);
  }

  reorderItems(indexes : any) : void
  {
     // Update the array to reflect the reordered indexes of the list items
     this.items = reorderArray(this.items, indexes);
     this._localUser.settings.parcelDescriptions = this.items;

     //changed
     this._isChanged = true;
  }

  onAddType() {
    if ('' !== this._newType) {
      const index = this.items.indexOf(this._newType, 0);
      if (index > -1) {
        console.log('duplicated')
      }
      else{
        this.items.push(this._newType);
        this._newType = '';
        //changed
         this._isChanged = true;
      }
      
    }
  }

  removeItem(item) {
    console.log(item);
    const index = this.items.indexOf(item, 0);
    if (index > -1) {
      this.items.splice(index, 1);
       //changed
       this._isChanged = true;
    }
    
  }

  onCheck() {
    console.log(this.items);
  }

  
  ionViewWillLeave() {

    let user = this._userService.getLocalUser();
    if (user){
      if (this._isChanged)
      {
        let optoins = {
          parcelDescriptions: this._localUser.settings.parcelDescriptions,
        };
        this._userService.updateOptionSettings(optoins)
        .subscribe(
          data => {
              this._userService.syncUserFromDB();
          },
          error => {
        });
      }
    }
  }
}
