import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController  } from 'ionic-angular';

import { GeoIP } from '../../../../../providers/job/index';
import { Job, JobsService} from '../../../../../providers/job/index';

@Component({
  selector: 'page-job-action-operations',
  templateUrl: 'job-action-operations.html',
})
export class JobActionOperationsPage {

  public firstNoneOperatorsName = 'please select an operation';
  public deliverySuccStr = 'delivered succ';
  public pickupStr= 'picked up';
  public  _operatorsList = [
    {name: this.firstNoneOperatorsName,newStatus:''},  
    {name:'added notes',newStatus:''},
    {name: this.deliverySuccStr, newStatus:'closed'},
    {name:'failed delivery, card left',newStatus:'closed'},
    {name:'failed delivery, try next time',newStatus:''},
    {name:'closed the job',newStatus:'closed'},
    {name: this.pickupStr,newStatus:'closed'}];
  
  public _job : Job = null;
  public _isOneKeyAction = false;
  public  _operatorDropdownTitle = this.firstNoneOperatorsName;
  public  _notice: string = '';

  constructor(public navCtrl: NavController, public navParams: NavParams,
            private toastCtrl: ToastController,
            public viewCtrl: ViewController,
            private _jobService: JobsService, private _geoIP: GeoIP) {
    this._job = navParams.get("job");
    this._isOneKeyAction = navParams.get('isOneKeyAction');
    if (this._job){
      //console.log(this._job);
      if('delivery' == this._job.type){
        this._operatorDropdownTitle = this.deliverySuccStr;
      }
      else if('pickup' == this._job.type){
        this._operatorDropdownTitle = this.pickupStr;
      }
    }
    console.log(this._isOneKeyAction);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad JobActionOperationsPage');
    if (this._isOneKeyAction) {
      this.onOperatorUpdate();
      console.log('One key click called');
    }
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

  onOperatorUpdate() {
    if (this._operatorDropdownTitle == this.firstNoneOperatorsName) {
      let toast = this.toastCtrl.create({
        message: 'Please select an operation',
        duration: 3000,
        position: 'bottom'
      });
    
      toast.present();
      return;
    }

    for (let op of this._operatorsList) {
      if (op.name == this._operatorDropdownTitle) {
        this.updateOperation(op,this._notice);
        break;
      }
    }

    this.navCtrl.pop();
  }
}
