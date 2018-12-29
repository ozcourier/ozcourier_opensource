import { Address, AddressFunc } from '../util/address';

export class Job_Description {
    name: string;
    value: string;
}

export class Job_Running_Status {
    isGeoAddressOK: boolean;
}

export interface Job_Delivery{
    quantity: number;
    parcel_detail: Job_Description[];
    notice: string;
}

export interface Job_Pickup{
    notice : string
}

export interface Job_Other{
    notice : string
}

export class  Job {
    _id: string;
    driver_id: string;
    last_modify: Date;
    type: string;    //delivery or pickup
    //company: string;

    //job descriptions
    address: Address;

    notice: string;
    //delivery: Job_Delivery;
    //pickup: Job_Pickup;
    //other: Job_Other;

    //GEO information
    //lat: number;
    //lon: number;
    geo_status: number; //GEO get status: 0: not ; 1: get succ; 2: get failed

    //job status change properties
    status: string;
    operates: any [];

    //Running status, not save to server, but save in local storage, 
    //when it's dirty, means it not updated to server correctly
    //should upload to server when it's deleted from localstorage
    isDirty: boolean;
    triedTimes: number;
}

export enum JobServiceSubscriberTypes {
    updateAll,
    updateOne,
    addJobSucc,
    addJobFail,
    updateJobSucc,
    updateJobFail,
    deleteJobSucc,
    deleteJobFail,
    historyQuerySucc,
    historyQueryFail,
}

export class JobServiceSubscriber {
    type: JobServiceSubscriberTypes;
    msg: string;
    job: Job;
    returnId: string;
}

export class JobOperationDef{
    public _job: Job;
    public _operatorDropDownDefaultTitle = 'please select a operation'
    public _operatorCurSelectOp = null;
    public _operatorNotice: string;
    
    public _operatorsList = [{name:'Add notice',newStatus:''},
                              {name:'Delivered', newStatus:'closed'},
                              {name:'Failed delivery, card left',newStatus:'closed'},
                              {name:'Failed delivery, try next time',newStatus:''},
                              {name:'Close the job',newStatus:'closed'}];
}

export class DeliveryMarkItemDef {
    _id: string;    //the id of the marker , we use the first jobId instead to avoid make one

    jobIds: string [];
  
    lat: number;
    lng: number;
    title: string;
    content: string;
    draggable: boolean;
    iconUrl: string;

    marker: any;
  }

export class JobFilterType{
    name: string;
    checkedList: string [] = [];
}

export class JobStorageFormat{
    public getJobByJobJson(jobJson) {
        var job = new Job();
        job.type = jobJson['type'];
        job.address = new Address();
        job.address.faddr = jobJson["address"]["faddr"],
        job.address.addr = jobJson["address"]["addr"],
        job.address.city = jobJson["address"]["city"],
        job.address.lat = jobJson["address"]["lat"],
        job.address.lng = jobJson["address"]["lng"],

        job._id = jobJson["_id"];
        job.driver_id = jobJson["driver_id"];
        job.last_modify = new Date(jobJson["last_modify"]);
        //ob.quantity = jobJson["quantity"];
        job.notice = jobJson["notice"]
        job.status = jobJson["status"];

        if('geo_status' in jobJson) {
            job.geo_status = jobJson['geo_status'];
        }
        else {
            job.geo_status = AddressFunc.isGeoValid(job.address)? 1:0;
        }
        if ('operates' in jobJson) {
            job.operates = jobJson['operates'];
        }
        else{
            job.operates = [];
        }
        job.isDirty = false;
        if ('isDirty' in jobJson){
            job.isDirty = jobJson['isDirty'];
        }
        
        return job;
    }

    public getJobJsonByJob(job: Job) {
        var jobJson = {
            _id: job._id,
            type: job.type,
            driver_id: job.driver_id,
            last_modify: job.last_modify,
            notice: job.notice,
            status: job.status,
            address: {
                faddr: job.address.faddr,
                addr: job.address.addr,
                city: job.address.city,
                lat: job.address.lat,
                lng: job.address.lng,
            },
            geo_status: job.geo_status,
            operates: job.operates,
            isDirty: job.isDirty,   
        };

        return jobJson;
    }
}