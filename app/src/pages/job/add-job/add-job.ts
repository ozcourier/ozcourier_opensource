import { Component, ViewChild, ElementRef, Input,  } from '@angular/core';
import { NavController, NavParams, ToastController, Select } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { WalkthroughPage } from '../../walkthrough/walkthrough';
import { UserService } from '../../../providers/user/index';
import { GeoIP } from '../../../providers/job/index';
import { Address, AddressFunc, WalkThroughService } from '../../../providers/util/index';
import { Job, JobsService, JobServiceSubscriberTypes } from '../../../providers/job/index';
import { ExtendAddress, ExtendAddressesService } from '../../../providers/util/index';

declare var google: any;

export interface AddJobList{
  index: number;
  job: Job;
  status: string;
  geo_status: string;
}

@Component({
  selector: 'page-add-job',
  templateUrl: 'add-job.html',
})
export class AddJobPage {

  public _addedJobList: AddJobList[] = [];
  
  public _addr: string = '';
  public _type: string = "delivery";
  public _notice: string = "";
  public _noticeSel: string = "";

  public _isShowAddrList: boolean = false;

  //subscriber the job service notification
  private _jobServiceSubscription: Subscription;
  private _userServiceSubscription: Subscription;
  public _matchedStreet = [];

  //extend address
  public isShowExtendAddr: boolean = false;
  public _extendAddr: string = '';
  public _isShowExtendAddrList: boolean = false;
  public _matchedExtendAddr: ExtendAddress[] = [];
  public _matchExtendAddrSearchStr: string = '';
  public _selectExtendAddr: ExtendAddress = null;

  //google address auto complete
  @ViewChild('searchbar', { read: ElementRef }) searchbar: ElementRef;
  addressElement: HTMLInputElement = null;
  autocomplete: any;
  autoCompletAddr: Address = null;
  @ViewChild('sectionSelect') sectionSelect: Select;
  @ViewChild('myAddrInput') myAddrInput: Input;

  public _notesList: string[] = [];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private toastCtrl: ToastController,
              private _userService: UserService,
              public _geoIP: GeoIP,
              private _jobsService: JobsService,
              public _extendAddressesService: ExtendAddressesService,
              private _walkThroughService: WalkThroughService) {
  }

  ionViewDidLoad() {

    if (this._walkThroughService.getPageWalkThroughStatus('add job')){
      this.navCtrl.push(WalkthroughPage, {name: 'add job'});
    }

    this._jobServiceSubscription = this._jobsService.getNotify().subscribe(
      msg => {
        switch(msg.type) { 
          case JobServiceSubscriberTypes.addJobSucc: {
            console.log('Add job successful');
            let addJob = this.getJobFromAddedList(msg.job);
            if (addJob) {

              addJob.job._id = msg.returnId;
              addJob.status = 'added';
              //start to get the GEO 
              if (!AddressFunc.isGeoValid(addJob.job.address)){
                this.getJobGetGeoCode(addJob);  
              }
            }
            break;
          }
          case JobServiceSubscriberTypes.addJobFail: {
            if (msg.job) {

              console.log("Add job failed: " + msg.msg);
              let addJob = this.getJobFromAddedList(msg.job);
              if (addJob) {
                addJob.status = 'failed';
              }
              let errorMsg = "connect to server failed";
              if ('msg' in msg){
                if (msg.msg){
                  errorMsg = msg.msg;
                }
              }
              let toast = this.toastCtrl.create({
                message: "Failed to add job:" + msg.job.address.addr + ",<br>error: " + errorMsg + ",<br>please check internet connection.",
                duration: 3000,
                position: 'bottom'
              });
            
              toast.present();
            }
            break;
          }
          default: {
            break;
          }
        }
    });

    this._userServiceSubscription = this._userService.getNotify().subscribe(
      msg => {
        //console.log('get notify',msg);
        console.log("user updated");
        this.preLoadData();
      }
    );

    this.preLoadData();
    this.getCurrentJobs();
    this.initAutocomplete();
  }

  initAutocomplete(): void {
    // reference : https://github.com/driftyco/ionic/issues/7223
    this.addressElement = this.searchbar.nativeElement.querySelector('.searchbar-input');
    this.createAutocomplete(this.addressElement).subscribe((location) => {
      console.log('Searchdata', location);
      this.autoCompletAddr = location;
      //need to remove the extend address
      if ('' != this._extendAddr){
        this._extendAddr = '';
      }
    });
  }

  createAutocomplete(addressEl: HTMLInputElement): Observable<any> {
    var user = this._userService.getLocalUser();

    var circle = new google.maps.Circle({
      center: { lat: user.company.mapSetting.lat, lng: user.company.mapSetting.lng},
      radius: 5000
    });
    var options = {
      bounds: circle.getBounds(),
    };
    this.autocomplete = new google.maps.places.Autocomplete(addressEl, options);

    return new Observable((sub: any) => {
      google.maps.event.addListener(this.autocomplete, 'place_changed', () => {
        const place = this.autocomplete.getPlace();
        if (!place.geometry || !place.formatted_address) {
          sub.error({
            message: 'Autocomplete returned place with no geometry'
          });
        } else {
          console.log('Search Lat', place.geometry.location.lat());
          console.log('Search Lng', place.geometry.location.lng());
          sub.next({faddr: place.formatted_address, 
            addr: place.name ? place.name: '',
            city: place.vicinity ? place.vicinity: '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()});
        }
      });
    });
  }

  public getCurrentJobs() {
    var usr = this._userService.getLocalUser();
    if (usr) {
      console.log(usr);
      this._jobsService.GetCurrentJobList(usr._id);
      console.log("onSync() called");  
    }
  }

  preLoadData() {
    //get the current city list
    let user = this._userService.getLocalUser();
    this._notesList = user.settings.parcelDescriptions;

    //load extend address
    if (user){
      this._matchedExtendAddr = this._extendAddressesService.getExtendAddressList();
      if (this._matchedExtendAddr.length === 0) {
        this._extendAddressesService.getExtendAddrsFromServer()
        .subscribe(
          data => {
            this._matchedExtendAddr = this._extendAddressesService.getExtendAddressList();
          },
          error => {
        });
      }
    }
  }

  private getJobFromAddedList(job: Job) {
    for (let ea of this._addedJobList) {
      if ((ea.job._id === job._id) && (ea.job.address.addr === job.address.addr)) {
        return ea;
      }
    }
  }

  private getJobGetGeoCode(addJob: AddJobList) {
    var job: Job = addJob.job;
    let address = AddressFunc.getFullAddress(job.address);
    this._geoIP.getGeocoding(address)
      .subscribe(
        place => {
          //console.log(address + "GEO is:" + place.lat + ':' + place.lng);
          job.address.lat = place.lat;
          job.address.lng = place.lng;
          job.geo_status = 1;//get GEO success
          this._jobsService.updateParcelGeo(job._id, place.lat, place.lng);
          addJob.geo_status = "GEO OK";

        },
        error => {
          let toast = this.toastCtrl.create({
            message: "Failed to get GEO for " + address + ", error: " + error,
            duration: 5000,
            position: 'bottom'
          });
          toast.present();

          console.log("Failed to get GEO for " + address + ", error: " + error);
          job.geo_status = 2;//get GEO fail
          this._jobsService.updateParcelGeoFailbyJob(job);
          addJob.geo_status = "GEO Fail";
      });
  }

  public onAdd(){
    var job= new Job();

    //address auto complete can't be empty
    if ((!this.autoCompletAddr || ("" === this.autoCompletAddr.addr))
     && ('' == this._extendAddr)) {
      let toast = this.toastCtrl.create({
        message:  "The address can't be empty, or select from my address",
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
      return;
    }

    console.log("job type:" + this._type);
    if (this.autoCompletAddr){
      console.log("job address:" + this.autoCompletAddr.addr);
    }
    if ('' != this._extendAddr) {
      console.log("job my address:" + this._extendAddr);
    }
    console.log("job notice:" + this._notice);

    let user = this._userService.getLocalUser();

    job._id = this._jobsService.createRadomNewId();//use it temporary
    job.driver_id = user._id;
    job.last_modify = new Date();
    job.type = this._type;
    job.status = 'open';
    job.address = new Address();

    if ('' != this._extendAddr) {
      let searchStrs = this.getSearchExtendAddrStr(this._extendAddr);
      for (let searchStr of searchStrs) {
        let sts = this._extendAddressesService.searchExtendAddress(searchStr);
        if (sts.length > 0) {
          //got some result, need to check whether it's ture match
          for (let st of sts) {
            console.log(st);
            let exAddrRepStr = this.getExtendAddressReplaceStr(st);
            if (exAddrRepStr.toLocaleLowerCase() === searchStr.toLocaleLowerCase()){
              job.address.faddr = this._extendAddr;
              job.address.addr = this._extendAddr;
              job.address.city = '';
              job.address.lat = st.lat;
              job.address.lng = st.lng;
              console.log("Get GEO by extend address");
              break;
            }
          }
          break;
        }
      }

      if ('' == job.address.faddr){
        let toast = this.toastCtrl.create({
          message:  "Wrong My Address, can't find it",
          duration: 3000,
          position: 'bottom'
        });
        toast.present();
        return;
      }
    }
    else{
      //use the autocomplete address
      job.address.faddr = this.autoCompletAddr.faddr;
      job.address.addr = this.autoCompletAddr.addr;
      job.address.city = this.autoCompletAddr.city;
      job.address.lat = this.autoCompletAddr.lat;
      job.address.lng = this.autoCompletAddr.lng;  
    }

    if (('' != this._notice) && ('' != this._noticeSel)){
      job.notice = this._noticeSel + ',' + this._notice;
    }
    else{
      job.notice = this._noticeSel + this._notice;
    }

    job.geo_status =  AddressFunc.isGeoValid(job.address)? 1 : 0;
    job.operates = [{
                      act: 'Created', 
                      notice: '', 
                      dt: Date.now(),
                      lat: 0,
                      lng: 0
                    }];

    job.isDirty = false;

    //add to the addedJobList to show below:
    let addJobItem:AddJobList = {
                      index: this._addedJobList.length+1,
                      job:job,
                      status:"adding",
                      geo_status: (0 == job.geo_status)? "none":"GEO OK"
                    };
    this._addedJobList.splice(0,0,addJobItem);

    this._jobsService.addJob(job);

    //reset to default value
    this._addr = '';
    this._type = "delivery";
    this._extendAddr = "";
    this._notice = "";
    this._noticeSel = "";
    this._isShowExtendAddrList = false;
    this.isShowExtendAddr = false;
  }

  selMyAddressClick(){
    this.sectionSelect.open();
  }

  getExtendAddressReplaceStr(extAddr: ExtendAddress) {
    return extAddr.name;
  }

  updateStreetStrByExtendAddrSel(addr:string, extAddr: ExtendAddress){

    var index = addr.toLowerCase().lastIndexOf(this._matchExtendAddrSearchStr.toLowerCase());
    console.log(index);
    console.log(addr, extAddr);

    if ((index < 0) || (index >= addr.length)){
      //don't find the space, don't need to match
      return "";
    }

    console.log(index, addr, this._matchExtendAddrSearchStr);
    return (addr.substr(0, index) + this.getExtendAddressReplaceStr(extAddr));
  }

  getSearchExtendAddrStr(addr:string){
    var splitted = addr.split(" ", 3);
    var ret: string[] = [];

    //remove '' from the splitted strings
    splitted = splitted.filter(x => (x.trim() != ''));

    console.log(splitted);
    //console.log(splitted.length);
    for (let i=0; i< splitted.length; i++){
      let searchStr = splitted[i].trim();
      if ((i+1) < splitted.length){
        for (let j=i+1; j< splitted.length; j++){
          searchStr = searchStr + ' ' + splitted[j].trim();
        }
      }
      if ('' != searchStr){
        ret.push(searchStr);
      }
    }

    //console.log("addr:", addr);
    console.log("result:", ret);

    return ret;
  }

  searchExtendAddress(addr) {
    var sts: ExtendAddress[] = [];
    this._matchedExtendAddr = [];
    //console.log("searchExtendAddress() called, searchStr=" + addr);
    if (addr.length ==0) {
      return;
    }

    let searchStrs = this.getSearchExtendAddrStr(addr);
    for (let searchStr of searchStrs) {
      sts = this._extendAddressesService.searchExtendAddress(searchStr);
      var count = 0;
      if (sts.length > 0) {
        //got some result, need to show it up
        for (let st of sts) {
          this._matchedExtendAddr.push(st);
          count = count + 1
          if (count >= 10){
            break;
          }
        }

        //don't need to search any more
        this._matchExtendAddrSearchStr = searchStr;
        break;
      }
    }


    console.log(this._matchedExtendAddr);
    if (this._matchedExtendAddr.length> 0){
      this._isShowExtendAddrList = true;
    }
    else{
      this._isShowExtendAddrList = false;
    }
  }

  onExtendAddressSel(exAddr){
    this._isShowAddrList = false;
    var addr = this._extendAddr;
    var newAddr:string = this.updateStreetStrByExtendAddrSel(addr, exAddr);
    console.log(newAddr);

    this._extendAddr = newAddr;

    //update notes if needed
    if ('' != exAddr.notes){
      if ('' == this._notice){
        this._notice = exAddr.notes;
      }
      else {
        this._notice = this._notice + ', ' + exAddr.notes;
      }
    }

    this._matchedExtendAddr = [];
    this._selectExtendAddr = exAddr;
  }

  comparPrex(inputPrex, ListStr){
    var i: number;
    for (i=0; i<inputPrex.length; i++){
      if (inputPrex.charAt(i).toLowerCase() != ListStr.charAt(i).toLowerCase()){
        break;
      }
    }
    if (i == inputPrex.length){
      return true;
    }
    return false;
  }

  getIconByStatus(status: string) {
    var iconName: string = "";
    console.log("getIconByStatus called");
    switch (status) {
      case "adding" :{
        iconName = "ios-cloud-upload-outline";
        break;
      }
      case "added" :{
        iconName = "ios-cloud-done-outline";
        break;
      }
      case "failed" :{
        iconName = "ios-close-outline";
        break;
      }
    }
    console.log(iconName);
    return iconName;
  }

  getIconByGeoStatus(status: string) {
    var iconName: string = "";
    switch (status) {
      case "GEO OK" :{
        iconName = "ios-locate-outline";
        break;
      }
    }
    console.log(iconName);
    return iconName;
  }

}
