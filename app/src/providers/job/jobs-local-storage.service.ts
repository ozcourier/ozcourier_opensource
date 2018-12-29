import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import {Observable} from "rxjs/Observable";

import { AppConfig } from '../../app/app.config';
import { Job, JobStorageFormat } from './jobs';
import { AddressFunc } from '../util/index';

@Injectable()
export class JobsLocalStorageService {

    private jobKeyPrefix:string = 'job';
    _joblist: Job[] = [];

    constructor(private _storage: Storage, private config: AppConfig) {
    }

    public getJobKey(job: Job) {
        if ('' != job._id) {
            return this.config.localstorageheader + this.jobKeyPrefix + ' ' + job._id;
        }
        else {
            return this.config.localstorageheader + this.jobKeyPrefix + ' ' + AddressFunc.getShortAddress(job.address);
        }
    }

    public isValidJobKey(key) {
        return (0 === key.indexOf(this.jobKeyPrefix));
    }

    getMultiple(keys: string[]) {
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

    public saveJob(job: Job){
        var _jobStorageFormat: JobStorageFormat = new JobStorageFormat() ;
        let key = this.getJobKey(job);

        let jobJson = _jobStorageFormat.getJobJsonByJob(job);
        this._storage.set(key, JSON.stringify(jobJson));
        //console.log("saved job:", jobJson);
    }

    public deleteJob(job: Job) {
        console.log("delete job:", this.getJobKey(job));
        this._storage.remove(this.getJobKey(job));
    }

    public onJobIdUpdate(job: Job, newKey: string) {
        console.log("need to support");
        this._storage.remove(this.getJobKey(job));
        //tempary save the old key and restore it later
        let oldKey = job._id;
        job._id = newKey;
        this._storage.set(this.getJobKey(job), JSON.stringify(job));
        job._id = oldKey;
    }

    public getAllJobs() {
        var _jobStorageFormat: JobStorageFormat = new JobStorageFormat() ;
        this._joblist = [];

        return Observable.create(observer => {
        try {
            this._storage.keys().then((keys) => {
            let jobKeys = keys.filter(key => 0 === key.indexOf(this.jobKeyPrefix));

            this.getMultiple(jobKeys).then(result => {
                for (let key of jobKeys) {
                    if (result[key]){
                        let jobJson = JSON.parse(result[key]);
                        if (jobJson) {
                            let job: Job = _jobStorageFormat.getJobByJobJson(jobJson);
                            this._joblist.push(job);
                        }
                    }
                }
                observer.next(this._joblist);
                observer.complete();    
            })
        });
        } catch (error) {
            observer.error('Failed to get jobs from local storage' + error);
            observer.complete();
        }});
    }

}