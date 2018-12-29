import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';

import { Job, JobServiceSubscriberTypes, JobServiceSubscriber } from './jobs';
import { JobList } from './joblist';
import { JobsServerStorageService } from './jobs-server-storage.service';
import { JobsLocalStorageService } from './jobs-local-storage.service';
import { AddressFunc, LogsService } from '../util/index'

@Injectable()
export class JobsService {

    public _lastLocalStorageLoadDate: Date = null;
    public _isLoaded: boolean = false;
    public _isRemoteServerTodayJobLoaded: boolean = false;
    public _isRemoteServerOpenJobLoaded: boolean = false;
    public _joblist: JobList;
    public _isUptoDate = false;

    private _jobServiceSubscriber = new Subject<JobServiceSubscriber>();

    public _jobHistoryList: JobList;
    public _outDateDirtyJobList: JobList;
    public _hasDirtyCurrentJob: boolean = false;

    constructor(
        private _logsService: LogsService,
        private _localStorage: JobsLocalStorageService,
        private _serverStorage: JobsServerStorageService) {
        this._joblist = new JobList();
        this._jobHistoryList = new JobList();
        this._outDateDirtyJobList = new JobList();
    }

    sendNotify(msg:JobServiceSubscriber) {
        this._jobServiceSubscriber.next(msg);
    }

    getNotify() {
        return this._jobServiceSubscriber.asObservable();
    }

    clearNotify() {
        this._jobServiceSubscriber.next();
    }

    public removeJob(_job_id: string){
        this._joblist.removeJob(_job_id);
    }

    public getJobByID(_id:string) {
        return this._joblist.getJobByID(_id);
    }

    public setCurrentJobDirtyFlag(job: Job) {
        if (job.isDirty){
            this._hasDirtyCurrentJob = true;
        }
    }

    public onGetServerJobList(jobList: Job[]) {
        //console.log(address + "GEO is:" + place.lat + ':' + place.lng);
        //Server response won't have dirty flag
        if (jobList) {
            var updatedCount = 0;
            for (let job of jobList) {
                let dirtyJob = this._outDateDirtyJobList.getJobByID(job._id);
                if (dirtyJob){
                    //dirty job exists
                    if (dirtyJob.last_modify < job.last_modify){
                        this._joblist.addJob2List(job);
                        this._localStorage.saveJob(job);//save to local storage too.
                        updatedCount = updatedCount + 1;
    
                        //dirty job out of date
                        console.log("should not come here");
                        dirtyJob.isDirty = false;
                        this._outDateDirtyJobList.removeJob(dirtyJob._id);
                    }
                }
                else if (this._joblist.isNewerJob(job)){
                    this._joblist.addJob2List(job);
                    this._localStorage.saveJob(job);//save to local storage too.
                    updatedCount = updatedCount + 1;
                }
            }
    
            if (updatedCount > 0) {
                this._logsService.log("success","Sync jobs with server success");
                this.sendNotify({type: JobServiceSubscriberTypes.updateAll, msg:'', job: null, returnId:''});
            }
        }
    }

    public getTodaysJobFromServer(userId) {

        //only load once
        if (this._isRemoteServerTodayJobLoaded){
            return;
        }

        var today = new Date();
        var startDate = today.getFullYear().toString() + '-' + (today.getMonth()+1).toString() + '-' + today.getDate().toString();
        let myParams = {};
        myParams['startdate'] = startDate;
        myParams['enddate'] = startDate;

        console.log("getTodaysJobFromServer() called");

        this._serverStorage.getAllJobs(userId, myParams)
          .subscribe(
            jobList => {
                this.onGetServerJobList(jobList);
                this._isRemoteServerTodayJobLoaded = true;
          },
          error => {
            console.log("Get today jobs from server storage failed.");
          });

        return;
    }

    public getOpenJobFromServer(userId) {

        if (this._isRemoteServerOpenJobLoaded){
            return;
        }

        let myParams = {};
        myParams['status'] = 'open';


        console.log("getOpenJobFromServer() called");
        this._serverStorage.getAllJobs(userId, myParams)
          .subscribe(
            jobList => {
                this.onGetServerJobList(jobList);
                this._isRemoteServerOpenJobLoaded = true;
          },
          error => {
            console.log("Get open jobs from server storage failed.");
          });
        return;
    }

    public getJobFromServer(userId) {
        this.getTodaysJobFromServer(userId);
        this.getOpenJobFromServer(userId);
    }

    public reloadJobFromServer(userId) {
        this._isRemoteServerOpenJobLoaded = false;
        this._isRemoteServerTodayJobLoaded = false;
        this.getJobFromServer(userId);
    }

    private isSameDay(date1: Date, date2: Date) {
        if ((date1.getDate() != date2.getDate()) 
            || (date1.getMonth() != date2.getMonth())
            || (date1.getFullYear() != date2.getFullYear())) {
            return false;
        }

        return true;
    }

    //Get current job list, only show today's job.
    public GetCurrentJobList(userId) {
        //sync the parcel list with the local storage and server
        var today = new Date();

        if (!this._lastLocalStorageLoadDate) {
            //first load
            this._lastLocalStorageLoadDate = new Date();
            console.log("first load");
        }

        //if last load is today, and local storage already loaded, now only sync with the server
        if (this._isLoaded && this.isSameDay(today, this._lastLocalStorageLoadDate)) {
            //only sync with the server, the local storage should be up-to-date
            this.getJobFromServer(userId);
            //this.sendNotify({type: JobServiceSubscriberTypes.updateAll, msg:'', job: null, returnId:''});
            return;
        }

        this._joblist.clearAllJobs();
        this._outDateDirtyJobList.clearAllJobs();

        this._localStorage.getAllJobs()
        .subscribe(
            jobList => {
                var oldCount = 0;
                
                if (jobList) {
                    for (let job of jobList) {
                        //remove the job if the job is not today's
                        if ((job.status === 'open') && (job.driver_id === userId)) {
                            this.setCurrentJobDirtyFlag(job);
                            this._joblist.addJob2List(job);
                        }
                        else {
                            if (this.isSameDay(job.last_modify, today) && (job.driver_id === userId)){
                                this.setCurrentJobDirtyFlag(job);
                                this._joblist.addJob2List(job);
                            }
                            else{
                                //old job, delete it from local storage
                                //if the job is dirty, need to update to server first
                                if (job.isDirty){
                                    //add to dirty list, it'll update to server when got server response ASAP
                                    this._outDateDirtyJobList.addJob2List(job);
                                }
                                else{
                                    //delete the job
                                    this._localStorage.deleteJob(job);
                                    oldCount = oldCount + 1;
                                }
                            }
                        }
                    }
                }

                console.log("local storage get jobs count:" + jobList.length + ", delete old count:" + oldCount);

                this._isLoaded = true;
                this._lastLocalStorageLoadDate = new Date();
                this.sendNotify({type: JobServiceSubscriberTypes.updateAll, msg:'', job: null, returnId:''});

                this._logsService.log("success","Sync jobs with local storage success, amount:" + this._joblist.getJobsAmount());

                //now sync with the server database
                this.getJobFromServer(userId);
            },
            error => {
                console.log("Get jobs from local storage failed.");
                this._logsService.log("Error","Sync jobs with local storage failed.");

                //now sync with the server database
                this.getJobFromServer(userId);
            });
    }

    //queryJobHistory: only query from the server and can't change able.
    public queryJobHistory(userId, options?: any) {

        this._jobHistoryList.clearAllJobs();

        //console.log(options);
        this._serverStorage.getAllJobs(userId, options)
        .subscribe(
            jobList => {
                if (jobList) {
                    for (let job of jobList) {
                        this._jobHistoryList.addJob2List(job);
                    }
                    //console.log(jobList);

                    this.sendNotify({type: JobServiceSubscriberTypes.historyQuerySucc, msg:'', job: null, returnId:''});
                }
            },
            error => {
                console.log("Get jobs from server storage failed.");
                this.sendNotify({type: JobServiceSubscriberTypes.historyQueryFail, msg:'', job: null, returnId:''});
      });
    }

    public createRadomNewId(){
        let date:Date = new Date();
        var newId = date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds() + '-' + Math.floor(Math.random()*(1000));
        //console.log(newId);
        return newId;
    }

    public updateJobOnResultFromServerAdd(oldId, newJob) {
        var job = this._joblist.getJobByID(oldId);
        if (job) {
            this._localStorage.deleteJob(job);
            job._id = newJob._id;
            if (newJob.last_modify > job.last_modify) {
                //something updated, but currently only lat:lng
                if (AddressFunc.isGeoValid(job.address)) {
                    job.address.lat = newJob.address.lat;
                    job.address.lng = newJob.address.lng;
                }
            }

            this._localStorage.saveJob(job);
        }
    }

    public addJob(parcel: Job){

        console.log(parcel);
        this._joblist.addJob2List(parcel);

        //save to local storage
        this._localStorage.saveJob(parcel);

        //save to server, if failed, set it to be dirty and upload later
        this._serverStorage.addJob(parcel)
        .subscribe(
            data => {
                console.log(data);
                this.updateJobOnResultFromServerAdd(parcel._id, data);
                this.sendNotify({type: JobServiceSubscriberTypes.addJobSucc, msg:'Add job success', job: parcel, returnId:data['_id']});
                this._logsService.log("success","Add job to server success, addr:" + AddressFunc.getShortAddress(parcel.address));
            },
            error => {
                parcel.isDirty = true;
                parcel.triedTimes = 0;
                this._localStorage.saveJob(parcel);
                this.setCurrentJobDirtyFlag(parcel);
                this.sendNotify({type: JobServiceSubscriberTypes.addJobFail, msg:error.error.error, job: parcel, returnId:''});
                this._logsService.log("Error","Add job to server failed. addr:" + AddressFunc.getShortAddress(parcel.address));
            });
    }

    public updateParcel(job: Job, updateContent) {
        this._localStorage.saveJob(job);

        this._serverStorage.updateParcel(job._id, updateContent)
            .subscribe(
                data => {
                    //this.sendNotify({type: JobServiceSubscriberTypes.updateOne, msg:'', job: job, returnId:''});
                    //upload dirty job is exists
                    this.handleDirtyJobWhenServerOk();
                },
                error => {
                    //set job dirty
                    job.isDirty = true;
                    job.triedTimes = 0;
                    this._localStorage.saveJob(job);
                    this.setCurrentJobDirtyFlag(job);

                    console.log(job);
                    console.log("update Job to server failed, need to handle it");
                    this._logsService.log("Error","update Job to server failed. addr:" +  
                        AddressFunc.getShortAddress(job.address) + ", content:" + JSON.stringify(updateContent));
            });

        this.sendNotify({type: JobServiceSubscriberTypes.updateOne, msg:'', job: job, returnId:''});
    }

    public updateParcelGeo(_id:string, lat, lng) {
        let deli:Job = this.getJobByID(_id);

        this.updateParcelGeobyJob(deli, lat, lng);
    }

    public updateParcelGeobyJob(job: Job, lat, lng) {
        if (job){
        //for (let ea of this._joblist){

            job.address.lat = lat;
            job.address.lng = lng;
            job.last_modify = new Date();
            job.geo_status = 1;

            //need to update the database;
            let updateContent = {
                last_modify: job.last_modify,
                lat : job.address.lat,
                lng : job.address.lng,
                geo_status: job.geo_status,
            };
            console.log("update GEO to database:", job._id, job.address.addr, updateContent);
            this.updateParcel(job, updateContent);
        }        
    }

    public updateParcelGeoFail(_id:string) {
        let deli:Job = this.getJobByID(_id);
        this.updateParcelGeoFailbyJob(deli);
    }

    public updateParcelGeoFailbyJob(job: Job) {
        if (job){
            job.last_modify = new Date();
            job.geo_status = 2;

            //need to update the database;
            let updateContent = {
                last_modify: job.last_modify,
                geo_status: job.geo_status
            };
            console.log("update GEO to database:", job._id, job.address.addr, updateContent);
            this.updateParcel(job, updateContent);
        }        
    }

    public updateParcelStatus(job: Job, status, newOperates) {
        job.status = status;
        job.last_modify = new Date();
        let updateContent = {
            last_modify: job.last_modify,
            status : job.status,
            operates: newOperates
        };
        if (newOperates) {
            job.operates.push(newOperates);
        }

        console.log("update Status to database:", job._id,job.address.addr, updateContent);
        this.updateParcel(job, updateContent);
    }

    public updateParcelStatusById(_id:string, status, newOperates) {
        let deli = this.getJobByID(_id);
        
        if (deli) {
            this.updateParcelStatus(deli, status, newOperates)
        }
    }

    deleteJob(_user_id: string, _job_id: string) {
        console.log("deleteJob:", _user_id," ", _job_id)
        this.removeJob(_job_id);

        let job = this.getJobByID(_job_id);        
        this._localStorage.deleteJob(job);
        return this._serverStorage.deleteJob(_user_id,_job_id);
    }

    public getCatalogueList(type:string) {
        var clist: string []= [];
        switch (type) {
            case "type":{
                clist.push('delivery');
                clist.push('pickup');
                clist.push('other');
                break;
            }
            case "status":{
                clist.push('open');
                clist.push('closed');
                break;
            }
            case "city":{
                for (let ea of this._joblist._joblist) {
                    if (!clist.some(x => x === ea.address.city)) {
                        clist.push(ea.address.city);
                    }
                }
                clist.sort();
                break;
            }
            default:{
                break;
            }
        }

        //console.log("Get catalogue return",type, clist);
        return clist;
    }

    public handleDirtyJobWhenServerOk() {
        console.log("handleDirtyJobWhenServerOk() called:", this._hasDirtyCurrentJob);
        if (this._hasDirtyCurrentJob) {
            let dirtycount = 0;
            for (let job of this._joblist._joblist){
                if (job.isDirty){
                    //handle current dirty job
                    console.log("try to update dirty job:", job);
                    dirtycount = dirtycount + 1;
                    this._serverStorage.updateDirtyParcel(job)
                    .subscribe(
                        data => {
                            job.isDirty = false;
                            if ('id' in data){
                                if (job._id != data['id']){
                                    this._localStorage.deleteJob(job);
                                    job._id = data['id'];
                                }
                            }
                            this._localStorage.saveJob(job);
                        },
                        error => {
                            console.log("Tried again, but still fail. the Job will update to server next time.");
                            console.log(job);
                            job.triedTimes = job.triedTimes + 1;
                            if (job.triedTimes >=5){
                                console.log("Tried 5 times, but still fail. the Job will not update to server.");
                                job.isDirty = false;
                                this._localStorage.saveJob(job);
                            }
                    });
                }
            }
            if (0 == dirtycount){
                this._hasDirtyCurrentJob = false;
            }
        }

        console.log("Outdate dirty jobs:", this._outDateDirtyJobList._joblist.length);
        for (let job of this._outDateDirtyJobList._joblist){
            //handle out date jobs
            this._serverStorage.updateDirtyParcel(job)
            .subscribe(
                data => {
                    //this.sendNotify({type: JobServiceSubscriberTypes.updateOne, msg:'', job: job, returnId:''});
                    job.isDirty = false;
                    this._outDateDirtyJobList.removeJob(job._id);
                    this._localStorage.deleteJob(job);
                },
                error => {
                    console.log("Tried again, but still fail. the Job can't update to server.");
                    console.log(job);

                    //for out of date job, just delete it because it should have tried a lots of times but still fail
                    job.isDirty = false;
                    this._outDateDirtyJobList.removeJob(job._id);
                    this._localStorage.deleteJob(job);
                });
        }        
           
    }
}