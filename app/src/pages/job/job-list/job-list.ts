import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

import { WalkthroughPage } from '../../walkthrough/walkthrough';
import { UserService } from '../../../providers/user/index';
import { Job, JobsService, JobServiceSubscriberTypes } from '../../../providers/job/index';
import { AddressFunc, WalkThroughService } from '../../../providers/util/index';


import { JobDetailPage } from '../job-detail/job-detail';

@Component({
  selector: 'page-job-list',
  templateUrl: 'job-list.html',
})
export class JobListPage {

  private _jobServiceSubscription: Subscription = null;

  public  _joblist:Job[] = [];
  public  _statuss = ["open","closed"];
  public  _pageAmount = 0;
  public  _curPage = 1;
  public  _pageIDList = [];
  public _curSelectedJob : Job;
  public _searchKey:string = '';

  constructor(public navCtrl: NavController, 
            public navParams: NavParams,
            private _userService: UserService,
            private _jobsService: JobsService,
            private _walkThroughService: WalkThroughService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad JobListPage');

    if (this._walkThroughService.getPageWalkThroughStatus('job list')){
      this.navCtrl.push(WalkthroughPage, {name: 'job list'});
    }

    this._jobServiceSubscription = this._jobsService.getNotify().subscribe(
      msg => {
        //console.log('get notify',msg);
        switch(msg.type) { 
          case JobServiceSubscriberTypes.updateAll:
          case JobServiceSubscriberTypes.addJobSucc: {
            console.log("get updateAll notify");
            this.onJobListUpdateAll();
            console.log('Sync with database successful');
            break;
          }
          case JobServiceSubscriberTypes.updateOne:{
            if (msg.job) {
              //this.addJob2JobList(msg.job)
              console.log('not support: add one job/ update one', AddressFunc.getShortAddress(msg.job.address));
            }
            break;
          }
          default: {
            console.log('need to implement later', msg);
            break;
          }
        }
    });

    this.getCurrentJobs();
  }

  ionViewDidEnter() {
    this.getCurrentJobs();
    this.getSearchItems();
  }

  public getCurrentJobs() {
    var usr = this._userService.getLocalUser();
    this._jobsService.GetCurrentJobList(usr._id);
    console.log("getCurrentJobs() called");
  }

  onJobListUpdateAll() {
    this._joblist = this._jobsService._joblist.getJobLists();
    console.log("jobs amount " + this._joblist.length);
    //console.log(this._joblist);
  }

  itemClicked(job) {
    this.navCtrl.push(JobDetailPage,{jobs: [job]});
  }

  getSearchItems() {
    // Reset items back to all of the items
    this.onJobListUpdateAll();

    // set val to the value of the ev target
    var val = this._searchKey;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this._joblist = this._joblist.filter((item) => {
        return ((item.address.addr.toLowerCase().indexOf(val.toLowerCase()) > -1) 
          || (item.address.city.toLowerCase().indexOf(val.toLowerCase()) > -1));
      })
    }
  }

  onReloadFromServer() {
    this._jobsService.reloadJobFromServer(this._userService.getLocalUserId());
  }

}
