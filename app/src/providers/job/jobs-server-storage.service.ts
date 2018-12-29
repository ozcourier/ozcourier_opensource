import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs/Observable";

import { AppConfig } from '../../app/app.config';
import { Job, JobStorageFormat } from './jobs';
import { UserService } from '../user/index';

@Injectable()
export class JobsServerStorageService {

    _joblist: Job[] = [];
    _dirtyJobList: Job[] = [];

    constructor(private config: AppConfig, private _userService:UserService, private http: HttpClient) {
    }

    public saveJob(job: Job){

    }

    private isJobInDirtyList(job: Job){
        for (let ea of this._dirtyJobList){
            if (job._id === ea._id){
                return true;
            }
        }

        return false;
    }

    private getDirtyJobbyId(job_id){
        for (let ea of this._dirtyJobList){
            if (job_id === ea._id){
                return ea;
            }
        }

        return null;
    }

    public getAllJobs(userId, options?: any) {
        var _jobStorageFormat: JobStorageFormat = new JobStorageFormat() ;
        var url = this.config.apiUrl + '/jobs/' + userId;
        return Observable.create(observer => {
        try {
            this.http.get<Job[]>(url ,this._userService.jwt(options))
            .subscribe(
                jobs => {

                    //save the dirty job
                    this._dirtyJobList = [];
                    for (let ea of this._joblist) {
                        if (ea.isDirty){
                            this._dirtyJobList.push(ea);
                        }
                    }
            
                    //clear all the current jobs
                    this._joblist = [];

                    //process the jobs from server
                    for (let deli of jobs) {
                        var job = _jobStorageFormat.getJobByJobJson(deli);
                        if (!this.isJobInDirtyList(job)){
                            this._joblist.push(job);
                        }
                        else{
                            let dirtyJob = this.getDirtyJobbyId(job._id);
                            if (dirtyJob){
                                this._joblist.push(dirtyJob);
                            }
                            else{
                                console.log("failed to get dirty job, should not come here");
                                this._joblist.push(job);
                            }
                        }
                    }
        
                    observer.next(this._joblist);
                    observer.complete();
                },
                error => {
                    observer.error('Failed to get jobs from server' + error);
                    observer.complete();
            });
        } catch (error) {
            observer.error('Failed to get jobs from server' + error);
            observer.complete();
        }});
    }

    public addJob(parcel: Job){
        //add the parcel to the datebase
        return this.http.post(this.config.apiUrl + '/jobs/addjob', parcel, this._userService.jwt());
    }

    public updateParcel(_id:string, updateContent) {
        let newUrl = this.config.apiUrl + '/jobs/job/' + _id;
        return this.http.put(newUrl, updateContent, this._userService.jwt());
    }

    public updateDirtyParcel(job: Job) {
        let newUrl = this.config.apiUrl + '/jobs/dirtyjob';
        return this.http.put(newUrl, job, this._userService.jwt());
    }

    deleteJob(_user_id: string, _job_id: string) {
        return this.http.delete(this.config.apiUrl + '/jobs/delete/' + _user_id + '/' + _job_id, this._userService.jwt());
    }
}