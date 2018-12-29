import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { LogsService, Log } from '../../../providers/util/index';

/**
 * Generated class for the LogsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-logs',
  templateUrl: 'logs.html',
})
export class LogsPage {

  public _logList: any = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private _logsService: LogsService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LogsPage');
  }

  ionViewDidEnter() {
    this.loadLogs();
  }

  compareLogs(x,y) {
    var xdate = new Date(x.date);
    var ydate = new Date(y.date);

    if (!((xdate.getTime() < ydate.getTime()) == (xdate < ydate))){
      console.log(x.date, y.date);
    }
    return (ydate.getTime() - xdate.getTime());
  }

  loadLogs() {
    this._logList = [];
    this._logsService.getAll()
    .subscribe(
      logList => {
        this._logList = logList;
        this._logList.sort((x,y) => {return new Date(y.date).getTime() - new Date(x.date).getTime()});
        console.log(this._logList);
      },
      error => {
          console.log("Get logs from local storage failed.");

      });
    
  }

  itemClicked(log: Log) {

  }
}
