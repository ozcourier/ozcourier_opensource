import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { WalkThroughService } from '../../providers/util/index';
/**
 * Generated class for the WalkthroughPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-walkthrough',
  templateUrl: 'walkthrough.html',
})
export class WalkthroughPage {

  public _pagename: string = '';
  public slides: any = null;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private _walkThroughService: WalkThroughService) {
    let pagename = navParams.get("name");
    if (pagename){
      this._pagename = pagename;
      this.slides = this._walkThroughService.getSlides(pagename);
    }

    if (!this.slides){
      console.log("can't get slides, will quit");
      this.navCtrl.pop();
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WalkthroughPage');
  }

  onclose() {
    this._walkThroughService.setPageWalkThroughStatus(this._pagename, false);
    this.navCtrl.pop();
  }
}
