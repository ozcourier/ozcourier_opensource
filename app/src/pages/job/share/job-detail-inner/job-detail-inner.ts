import { Component, Input } from '@angular/core';
import { NavController, NavParams, ModalController, App } from 'ionic-angular';

import { Job } from '../../../../providers/job/index';
import { JobActionOperationsPage } from '../job-action/job-action-operations/job-action-operations';

/**
 * Generated class for the JobDetailInnerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'job-detail-inner',
  templateUrl: 'job-detail-inner.html',
})
export class JobDetailInnerPage {
  public  _job : Job;
  public _disableOperation = 0;
  public _oneKeyAction = {name: 'Operations', childPage:JobActionOperationsPage};
  public _actions: any [] = [
                            {name: 'Operations', childPage:JobActionOperationsPage},
                            ];

  @Input() 
  set disableOpetion(value: number){
    this._disableOperation = value;
  }
  @Input()
  set job(job: Job) {
    this._job = job;
    console.log(this._job);
  }

  constructor(public navCtrl: NavController, 
            public navParams: NavParams,
            public modalCtrl: ModalController,
            public appCtrl: App) {
  }

  onActionClick(action) {
    console.log("onActionClick() called, action:" + action.name);
    if (action) {
      this.navCtrl.push(action.childPage, {job:this._job, isOneKeyAction: false});
    }
  }

  onOneKeyActionClick(action) {
    console.log("onOneKeyActionClick() called, action: OneKeyClick");
    if (action) {
      this.navCtrl.push(action.childPage, {job:this._job, isOneKeyAction: true});
    }
  }

  onMoreActionClick() {
    this.navCtrl.push(JobActionOperationsPage, {job:this._job, isOneKeyAction: false});
  }
}
