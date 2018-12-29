import { Component, NgZone, ViewChild } from '@angular/core';
import { NavController, Platform, FabContainer, AlertController, Content } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
} from '@ionic-native/google-maps';

import { UserService } from '../../providers/user/index';
import { Job, 
  JobsService, 
  JobServiceSubscriberTypes, 
  DeliveryMarkItemDef,
  GeoIP,
} from '../../providers/job/index';
import { AddressFunc, WalkThroughService } from '../../providers/util/index';

import { WalkthroughPage } from '../walkthrough/walkthrough';

import { JobDetailPage } from '../job/job-detail/job-detail';
import { AddJobPage } from '../job/add-job/add-job';
import { JobListPage } from '../job/job-list/job-list';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  map: GoogleMap;
  mapReady: boolean = false;

  private _jobServiceSubscription: Subscription;
  private _jobFilterServiceSubscription: Subscription;
  private _interValSubscription: Subscription;

  public _curSelectedJob : Job[] = [];
  public  _markList: DeliveryMarkItemDef[] = [];
  //public _openedMark: DeliveryMarkItemDef = null;

  //map center setting
  public _isMapSetting: boolean = false;

  contentBox: any;
  @ViewChild(Content) content: Content;

  settingFabs: Array<{title: string, component: any, icon: string, color: string}> = [
    {title: "Add Job", component: AddJobPage, icon:'plus', color:''},
    {title: "Job List", component: JobListPage, icon:'list-ul', color:''},
  ];

  constructor(public navCtrl: NavController,
    private zone: NgZone,
    private _platform: Platform,
    public  _alertCtrl: AlertController,
    private _userService: UserService,
    private _jobsService: JobsService,
    private _geoip: GeoIP,
    private _walkThroughService: WalkThroughService) {
  }

  ionViewDidLoad() {

    if (this._walkThroughService.getPageWalkThroughStatus('home')){
      this.navCtrl.push(WalkthroughPage, {name: 'home'});
    }

    console.log('ionViewDidLoad JobDeliveryPage');
    this._platform.ready().then(() => {
      this.loadMap();
    });  

    this._jobServiceSubscription = this._jobsService.getNotify().subscribe(
      msg => {
        //console.log('get notify',msg);
        switch(msg.type) { 
          case JobServiceSubscriberTypes.updateAll: {
            console.log("get updateAll notify");
            if (this.mapReady){
              this.onJobListUpdateAll();
            }
            console.log('Sync with database successful');
            break;
          }
          case JobServiceSubscriberTypes.updateOne:
          case JobServiceSubscriberTypes.addJobSucc: {
            if (msg.job) {
              //this.addJob2JobList(msg.job)
              console.log('add one job or updated notify:', AddressFunc.getShortAddress(msg.job.address));
              if (this.mapReady){
                this.onJobListUpdateAll();
              }
            }
            break;
          }
          default: {
            console.log('need to implement later', msg);
            break;
          }
        }
    });
  }

  ionViewDidEnter() {
    this.getCurrentJobs();

    if (this.mapReady) {
      this.onJobListUpdateAll();
      this.map.setClickable(true); 
    }

    this.content.resize();
  }

  ionViewWillLeave() {
    if (this.mapReady) {
      this.map.setClickable(false); 
    }
  }

  ngOnDestroy() {
    console.log("JobDeliveryPage.ts ngOnDestory called.");
    if (this._jobServiceSubscription) {
      this._jobServiceSubscription.unsubscribe();
      this._jobServiceSubscription = null;
    }
    if (this._jobFilterServiceSubscription) {
      this._jobFilterServiceSubscription.unsubscribe();
      this._jobFilterServiceSubscription = null;
    }
    if (this._interValSubscription) {
      this._interValSubscription.unsubscribe();
      this._interValSubscription = null;
    }
  }

  loadMap() {
    let user = this._userService.getLocalUser();
    if (!user) {
      console.log("loadMap() failed, can't get the user");
      return;
    }
    //console.log(user);
    this.map = GoogleMaps.create('map', {
      controls: {
        compass: false,
        myLocationButton: true,
        myLocation: true,
        indoorPicker: false,
        zoom: false
      },
      camera: {
        target: {
          lat: user.company.mapSetting.lat,
          lng: user.company.mapSetting.lng
        },
        zoom: Number(user.company.mapSetting.zoom),
      }
    });

    console.log("map created");
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      console.log('map is ready to use');
      this.mapReady = true;

      //this.getCurrentJobs();
      this.onJobListUpdateAll();

      if (this._userService.getIsUserFirstLogin()) {
        this.onMapSetting();
        this._userService.setIsUserFirstLogin(false);
      }
    });
  }

  public getCurrentJobs() {
    var usr = this._userService.getLocalUser();
    if (usr){
      this._jobsService.GetCurrentJobList(usr._id);
      console.log("getCurrentJobs() called");  
    }
  }

  updateMarkTitle(mark: DeliveryMarkItemDef) {
    //first remove the job's mark
    mark.title = "";
    var count=0;

    for (let jobid of mark.jobIds) {
      let job = this._jobsService.getJobByID(jobid);
      if ('open' == job.status) {
        //only show the number for the opened job
        if ('' != job.notice) {
          if ('' === mark.title){
            mark.title = job.notice;
          }
          else {
            mark.title = mark.title + ',' + job.notice;
          }  
        }
        count = count +1;
      }
    }

    if (count > 1) {
      //need to append count to the end of title
      mark.title = String(count) + 'x ' + mark.title;
    }
  }

  isSameGEOlocation(position1, position2){
    var latDiff = ((position1.lat - position2.lat)*1000000).toFixed();
    let lonDiff = ((position1.lng - position2.lng)*1000000).toFixed();
    if ((Math.abs(Number(latDiff)) < 50) && (Math.abs(Number(lonDiff)) < 50)){
      return true;
    }

    return false;
  }

  addOneJob2MarkList(job: Job) {
    //need to check the duplicated lat/lng, if so, it should only show one marker
    for (let ea of this._markList) {
      if (this.isSameGEOlocation({lat:ea.lat, lng: ea.lng}, {lat:job.address.lat, lng:job.address.lng})) {
        //the same address.
        if (!ea.jobIds.some(x => x === job._id)) {
          //need to add it the the current 
          ea.jobIds.push(job._id);
          this.updateMarkTitle(ea);
          return;
        }
      }
    }

    //creat new marker here
    var newMark = new DeliveryMarkItemDef();
    newMark._id = job._id;
    newMark.jobIds = [];
    newMark.jobIds.push(job._id);
    newMark.lat = job.address.lat;
    newMark.lng = job.address.lng;
    newMark.content = AddressFunc.getBriefAddress(job.address);
    newMark.draggable = false;
    newMark.iconUrl = 'assets/icon/'+job.type + '_' + job.status+'.png';
    this.updateMarkTitle(newMark);
    newMark.marker = null;
    //console.log(newMark.iconUrl);

    this._markList.push(newMark);
  }

  showMarkerListsOnMap() {
    for (let ea of this._markList) {
        //show 
      if (!ea.marker){
        this.map.addMarker({
          title: ea.content,
          snippet: ea.title,
          position: {lat:Number(ea.lat), lng: Number(ea.lng)},
          icon: { url : ea.iconUrl},
        }).then((marker: Marker) => {
          ea.marker = marker;

          marker.on(GoogleMapsEvent.INFO_CLICK).subscribe(() => {
            console.log("infor clicked " +  marker.getTitle());
            this.itemClicked(ea);
          });
        });
      }
    }
  }

  RemoveAllMarkersOnMap() {
    console.log("RemoveAllMarkersOnMap is called:" + this._markList.length);
    for (let ea of this._markList) {
      //show 
      if (ea.marker) {
        ea.marker.remove();
        ea.marker = null;
      }
    }
  }


  onJobListUpdateAll() {

    //remove all jobs in the markers
    for (let ea of this._markList){
      ea.jobIds = [];
    }

    //update jobs into the marker list
    let serverJobList = this._jobsService._joblist.getJobLists();
    console.log("jobs amount " + serverJobList.length);
    let showamount = 0;
    //for (let ea of this._jobsService._joblist._joblist) {
    for (let ea of serverJobList) {
      if (('open' === ea.status) && AddressFunc.isGeoValid(ea.address)) {
        showamount = showamount + 1;
        this.addOneJob2MarkList(ea);
      }
    }

    //remove all the markers don't have a job
    for (let ea of this._markList){
      if (0 == ea.jobIds.length){
        if (ea.marker) {
          ea.marker.remove();
          ea.marker = null;
        }
      }
    }
    this._markList = this._markList.filter(x => (x.jobIds.length > 0));

    //add marker to map if it's new marker
    this.showMarkerListsOnMap();

    console.log("show amount " + showamount + "," + this._markList.length);
  }

  itemClicked(marker:DeliveryMarkItemDef) {
    console.log(marker);
    var jobs: Job[] = [];
    for (let id of marker.jobIds) {
      let job = this._jobsService.getJobByID(id);
      if (job) {
        jobs.push(job);
      }
    }

    if (jobs.length > 0) {
      this.zone.run(()=>{this.navCtrl.push(JobDetailPage, {jobs: jobs})});
      
      //this.navCtrl.push(JobDetailPage, {jobs: jobs});
    }
  }

  onMapSettingConfirm(){
    this._isMapSetting = false;
    this.updateMapSettings();
  }

  updateMapSettings() {
    //console.log(this._lastCenterLat, this._lastCenterLng, this._LastZoom);
    if (!this.mapReady) {
      return;
    }
    try {
      let center = this.map.getCameraTarget();
      let zoom = this.map.getCameraZoom();
      zoom = (Math.floor(this.map.getCameraZoom()*10))/10;
      console.log(center.lat + ":" + center.lng + "-" + this.map.getCameraZoom());

      var mapSetting = {
        lat: this._geoip.latLonFixed(center.lat),
        lng: this._geoip.latLonFixed(center.lng),
        zoom: zoom,//Math.floor(this.map.getCameraZoom()),
      };
      console.log(mapSetting);
  
      this._userService.updateMapSetting(mapSetting)
        .subscribe(
          data => {
              //this._alertService.success('Update map setting successful', true);
              this._userService.syncUserFromDB();
  
          },
          error => {
              //this._alertService.error(error.error.error);
          });
    }
    catch (e){
      console.log(e);
    }
  }

  onMapSetting(){
      //set the map center in the page, don't need to navigate
      let alert = this._alertCtrl.create({
        title: 'Map center and zoom settings!',
        subTitle: 'Please move and zoom the map to your delivery area for perfect address search and veiw, then "confirm" it.',
        buttons: ['OK']
      });
      alert.present();      

      this._isMapSetting = true;

      return;
  }

  openSettingPage(fab: FabContainer, page){
    fab.close();
    this.navCtrl.push(page.component);
  }

  openAddJobPage(){
    let user = this._userService.getLocalUser();
    if (user){
      this.navCtrl.push(AddJobPage);
    }
  }
}
