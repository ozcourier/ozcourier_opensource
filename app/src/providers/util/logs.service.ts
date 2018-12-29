import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import {Observable} from "rxjs/Observable";

export class Log{
    type: string;
    message: string;
    date: Date;
}

@Injectable()
export class LogsService {

    private keyPrefix:string = 'log';
    _logList: Log[] = [];

    public isLogEnabled: boolean = false;

    constructor(private _storage: Storage,
        ) {
    }

    private getStorageKey(log: Log) {
        return this.keyPrefix + ' ' + log.date.getHours().toString() + ":" 
            + log.date.getMinutes().toString() + ":" + log.date.getSeconds().toString() + ":" 
            + log.date.getMilliseconds().toString();
    }

    private getMultiple(keys: string[]) {
        const promises = [];
      
        keys.forEach( key => promises.push(this._storage.get(key)));

        return Promise.all(promises).then( values => {
          const result = {};
                    
          values.map( (value, index) => { 
            result[keys[index]] = value;
          });
      
          return result;
        });
    }

    public isLogServiceEnabled()  {
        return this.isLogEnabled;
    }

    public log(type: string, message: string){
        if (!this.isLogEnabled) {return;}

        var log: Log = {
            type: type,
            message: message,
            date: new Date(),
        }

        this._storage.set(this.getStorageKey(log), JSON.stringify(log));
        console.log("saved log:" + JSON.stringify(log));
    }

    public delete(log: Log) {
        this._storage.remove(this.getStorageKey(log));
    }

    public getAll() {
        this._logList = [];

        if (!this.isLogEnabled) {return [];}

        return Observable.create(observer => {
        try {
            this._storage.keys().then((keys) => {
            let logKeys = keys.filter(key => 0 === key.indexOf(this.keyPrefix));

            this.getMultiple(logKeys).then(result => {
                for (let key of logKeys) {
                    if (result[key]){
                        let log: Log = JSON.parse(result[key]);
                        this._logList.push(log);
                    }
                }
                observer.next(this._logList);
                observer.complete();    
            })
        });
        } catch (error) {
            observer.error('Failed to get logs from local storage' + error);
            observer.complete();
        }});
    }

    public debugGetAllStorage() {
        var retList: any[] = [];

        if (!this.isLogEnabled) {return [];}

        return Observable.create(observer => {
        try {
            this._storage.keys().then((keys) => {
            let logKeys = keys;

            this.getMultiple(logKeys).then(result => {
                for (let key of logKeys) {
                    if (result[key]){
                        retList.push({key: key, value: result[key]});
                    }
                }
                observer.next(retList);
                observer.complete();    
            })
        });
        } catch (error) {
            observer.error('Failed to get logs from local storage' + error);
            observer.complete();
        }});
    }

}