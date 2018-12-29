import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, Platform } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { File } from '@ionic-native/file';
import { Diagnostic } from '@ionic-native/diagnostic';

import { WalkthroughPage } from '../../walkthrough/walkthrough';
import { UserService } from '../../../providers/user/index';
import { Job, JobsService, JobServiceSubscriberTypes } from '../../../providers/job/index';
import { WalkThroughService } from '../../../providers/util/index';
import { JobDetailPage } from '../../job/job-detail/job-detail';

@Component({
  selector: 'page-job-history',
  templateUrl: 'job-history.html',
})
export class JobHistoryPage {
  public _curDateStr: string = '';
  private _curDate: Date = new Date();
  public  _joblist:Job[] = [];
  private _jobServiceSubscription: Subscription;

  //search related
  public _curSelectedJob : Job;
  public _searchKey:string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private toastCtrl: ToastController,
    private _platform: Platform,
    //private datePicker: DatePicker,
    private file: File,
    private diagnostic: Diagnostic,
    private _userService: UserService,
    private _jobsService: JobsService,
    private _walkThroughService: WalkThroughService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad JobHistoryPage');

    if (this._walkThroughService.getPageWalkThroughStatus('job history')){
      this.navCtrl.push(WalkthroughPage, {name: 'job history'});
    }

    this._jobServiceSubscription = this._jobsService.getNotify().subscribe(
      msg => {
        //console.log('get notify',msg);
        switch(msg.type) { 
          case JobServiceSubscriberTypes.historyQuerySucc: {
            this.getSearchItems();
            break;
          }
          default: {
            console.log('Only supoort historyQuerySucc', msg);
            break;
          }
        }
    });

    if (this._platform.is('ios') || this._platform.is("core")){
      this._curDateStr = this._curDate.getFullYear().toString() + '-' + (this._curDate.getMonth()+1).toString() + '-' + this._curDate.getDate().toString();
      console.log("Updated curDateStr:", this._curDateStr);
    }
  }

  onDateChange(){
    console.log('Got date: ', this._curDateStr);
    this.getHistoryJobs();
  }

  getHistoryJobs() {
    console.log(this._curDateStr);
    var usr = this._userService.getLocalUser();
    let myParams = {};
    myParams['startdate'] = this._curDateStr;
    myParams['enddate'] = this._curDateStr;
    this._jobsService.queryJobHistory(usr._id,myParams);
  }

  onJobListUpdateAll() {
    this._joblist = this._jobsService._jobHistoryList.getJobLists();
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

  itemClicked(job) {
    this.navCtrl.push(JobDetailPage,{jobs: [job], disableOpetion:1});
  }

  getFileDir() {
    let directory = this.file.externalRootDirectory + 'Download/';
    return directory;
  }

  getFileName(directory: string) {
    let nameDate = this._curDate;
    if (!nameDate){
      nameDate = new Date();
    }

    return nameDate.getFullYear() + '-' + (nameDate.getMonth()+1) + '-' + nameDate.getDate() + '.txt';
  }

  getExportJson() {
    let headers = ['type', 'address', 'notice', 'status', 'operates'];
    let newList = [];
    for (let job of this._joblist) {
      let newJob = {};
      for (let head of headers){
        switch (head) {
          case 'operates': {
            newJob['operates'] = [];
            for (let op of job[head]){
              let newOp = {};
              if ('act' in op){
                newOp['act'] = op['act'];
              }
              if ('notice' in op){
                newOp['notes'] = op['notice'];
              }
              if ('dt' in op){
                newOp['modify_date'] =  new Date(op['dt']).toLocaleString();;
              }
              if (('lng' in op) && ('lat' in op)){
                newOp['GEO'] = op['lat'] + ':' + op['lng'];
              }
              newJob['operates'].push(newOp);
            }
            break;
          }
          default: {
            newJob[head] = job[head];
            break;
          }
        }
      }
      newList.push(newJob);
    }

    return newList;
  }

  replaceDate(key, value) {
    // Filtering out properties
    let ret = value;
    if (key === 'dt') 
    {
      try {
        ret = new Date(value).toLocaleString();
        console.log(ret);
      }
      catch (e) {
      }
    }

    return ret;
  }

  onExportAndroid() {

    if (this._joblist.length == 0){
      let toast = this.toastCtrl.create({
        message: "History is empty, please select another date",
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      return;
    }

    //get permission
    this.diagnostic.requestExternalStorageAuthorization().then((data)=>{
      //User gave permission 
      let directory = this.getFileDir();

      //build the file name
      let filename = this.getFileName(directory);
  
      //get content
      let newJobs = this.getExportJson();
      //let content = JSON.stringify(newJobs, this.replaceDate, 4);
      let content = JSON.stringify(newJobs, undefined, 4);
      console.log(content);

      //save to file
      this.file.writeFile(directory, filename, content, {replace: true}).then((res:any)=>{
        let toast = this.toastCtrl.create({
          message: "History saved to " + directory + '/' + filename,
          duration: 3000,
          position: 'bottom'
        });
        toast.present();
      },(error)=>{
        let toast = this.toastCtrl.create({
          message: "Failed to save history file",
          duration: 3000,
          position: 'bottom'
        });
        toast.present();
      });

    }).catch(error=>{
      //Handle error
      let toast = this.toastCtrl.create({
        message: "Can't get the permission to write file to local storage",
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    });
  }

  onExportIos() {

    if (this._joblist.length == 0){
      let toast = this.toastCtrl.create({
        message:  "History is empty, please select another date",
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      return;
    }

    //get permission
    //User gave permission 
    let directory = this.file.documentsDirectory;

    //build the file name
    let filename = this.getFileName(directory);

    //get content
    let newJobs = this.getExportJson();
    //let content = JSON.stringify(newJobs, this.replaceDate, 4);
    let content = JSON.stringify(newJobs, undefined, 4);
    console.log(content);

    //save to file
    this.file.writeFile(directory, filename, content, {replace: true}).then((res:any)=>{
      let toast = this.toastCtrl.create({
        message: "History saved to " + directory + '/' + filename,
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    },(error)=>{
      let toast = this.toastCtrl.create({
        message:  "Failed to save history file",
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    });
  }

  onExport() {
    if (this._platform.is('ios')){
      this.onExportIos();
    }
    else if (this._platform.is("android")){
      this.onExportAndroid();
    }
    else if (this._platform.is("core")){

    }
  }
}
