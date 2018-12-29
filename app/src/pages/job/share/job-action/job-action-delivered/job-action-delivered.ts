import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { GeoIP } from '../../../../../providers/job/index';
import { Job, JobsService} from '../../../../../providers/job/index';

@Component({
  selector: 'page-job-action-delivered',
  templateUrl: 'job-action-delivered.html',
})
export class JobActionDeliveredPage {

  public  _operatorsList = [{name:'Add notice',newStatus:''},
  {name:'Delivered', newStatus:'closed'},
  {name:'Failed delivery, card left',newStatus:'closed'},
  {name:'Failed delivery, try next time',newStatus:''},
  {name:'Close the job',newStatus:'closed'},
  {name:'Picked Up',newStatus:'closed'}];

  _job: Job = null;

  constructor(public navCtrl: NavController, 
            public navParams: NavParams,
            public viewCtrl: ViewController,
            private _jobService: JobsService,
            private _geoIP: GeoIP) {
    this._job = navParams.get("job");
    if (this._job){
      console.log(this._job);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad JobActionDeliveredPage');
  }

  dismiss() {
    this.navCtrl.pop();
  }

  updateOperateWithPosition(_op, _notic, lat, lng) {
    let newStatus = _op.newStatus;

    if ('' == newStatus) {
      newStatus = this._job.status;//don't change the status
    }

    let newOperates = {
      act: _op.name, 
      notice: _notic, 
      dt: Date.now(),
      lat: lat,
      lng: lng
    }

    this._jobService.updateParcelStatusById(this._job._id, newStatus, newOperates);
  }

  updateOperation(_op, _notic) {
    
        this._geoIP.getCurrentPosition().subscribe(
          position => {
            console.log('get current location succ: ' + position.coords);
            this.updateOperateWithPosition(_op, _notic, 
                  this._geoIP.latLonFixed(position.coords.latitude),
                  this._geoIP.latLonFixed(position.coords.longitude));
          },
          error => {
            console.error('ngui-map, error in finding the current position');
            this.updateOperateWithPosition(_op, _notic, 0, 0);
          }
        );
      }

  onDelivered() {
    for (let op of this._operatorsList) {
      if (op.name == 'Delivered') {
        this.updateOperation(op,'');
        break;
      }
    }

    this.navCtrl.pop();
  }

}
