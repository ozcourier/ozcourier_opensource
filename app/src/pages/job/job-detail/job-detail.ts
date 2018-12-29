import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, App } from 'ionic-angular';

import { Job } from '../../../providers/job/index';

@Component({
  selector: 'page-job-detail',
  templateUrl: 'job-detail.html',
})
export class JobDetailPage {
  public  _jobs : Job[] = [];
  public _disableOpetion = 0;
  public _activeFlags = {};

  constructor(public navCtrl: NavController, 
            public navParams: NavParams,
            public modalCtrl: ModalController,
            public appCtrl: App) {
    this._jobs = navParams.get("jobs");
    if (this._jobs){
      //console.log(this._jobs);
      for (let ea of this._jobs) {
        this._activeFlags[ea._id] = false;
      }
    }
    else {
      console.log("can't get job:" + navParams);
    }

    let disableOpetion = navParams.get("disableOpetion");
    if (disableOpetion){
      this._disableOpetion = disableOpetion;
    }
  }

  onJobButtonClick(job) {
    console.log("job button clicked:" + job._id);
    let curFlag = this._activeFlags[job._id];
    //close all    
    for (let ea of this._jobs) {
      this._activeFlags[ea._id] = false;
    }    

    this._activeFlags[job._id] = !curFlag;
    console.log(this._activeFlags);
  }

  onBack() {
    this.navCtrl.pop();
  }

}
