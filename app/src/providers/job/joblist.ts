import { Address } from '../util/address';
import { Job } from './jobs';

export class JobList {

    public _joblist: Job[] = [];

    public clearAllJobs() {
        this._joblist = [];
    }

    public getJobLists(){
        return this._joblist;
    }

    public getJobsAmount() {
        return this._joblist.length;
    }

    public removeJob(_job_id: string){
        for (var i=0; i<this._joblist.length; i++){
            if (this._joblist[i]._id == _job_id){
                this._joblist.splice(i,1);
                break;
            }
        }
    }

    public getJobByID(_id:string) {
        for (let ea of this._joblist){
            if (ea._id == _id){
                return ea;
            }
        }        
    }

    private spliteAddr(addr: string) {
        var addrsplited = addr.split(" ", 4);
        var stNo = "";
        var stName = "";
        for (let ea of addrsplited) {
            if (((ea[0] >= 'a') && (ea[0] <= 'z')) 
                || ((ea[0] >= 'A') && (ea[0] <= 'Z'))) {
                //it's a char, so should be the street number
                stName = ea;
                break;
            }
            else {
                stNo += ea;
            }
        }

        return {streetNo: stNo, streetName:stName};
    }

    private splitStreetNo(stNo) {
        var stNo1Num = 0;
        var stNo1Tail = '';

        for (let i in stNo) {
            var a = stNo.charAt(i);
            if (( a >= '0' ) && (a <='9')){
                stNo1Num = stNo1Num * 10 + Number(a);
            }
            else{
                stNo1Tail = stNo.substr(i+1);
                break;
            }
        }

        return {stNo:stNo1Num,stTail:stNo1Tail};

    }

    private compareAddress(ad1: Address,ad2: Address) {
        if (ad1.city != ad2.city) {
            return ad1.city > ad2.city ? 1: -1;
        }

        //get address name from "11 abc street"
        //var ad1No : string;
        //var ad1Name : string;
        let {streetNo:ad1No, streetName:ad1Name} = this.spliteAddr(ad1.addr);
        let {streetNo:ad2No, streetName:ad2Name} = this.spliteAddr(ad2.addr);
        //console.log("ad1No:", ad1No, "ad1Name:", ad1Name,"ad2No:", ad2No, "ad2Name:", ad2Name);
        if (ad1Name != ad2Name) {
            return ad1Name > ad2Name ? 1: -1;
        }

        //compare street number, need to change to number first
        let {stNo: ad1Number, stTail: ad1Ttail} = this.splitStreetNo(ad1No);
        let {stNo: ad2Number, stTail: ad2Ttail} = this.splitStreetNo(ad2No);
        if (ad1Number != ad2Number){
            return ad1Number > ad2Number ? 1: -1;
        }

        return ad1Ttail > ad2Ttail ? 1: -1;
    }

    private locationOf(deli: Job, array, start, end) {
        start = start || 0;
        end = end || array.length;
        var pivot = parseInt(start + (end - start) / 2, 10);
        
        //to avoid out of bounder
        if (pivot > array.length) {
            pivot = array.length;
        }

        if (end-start <= 1) {
            //now should be end
            //return this.compareAddress(deli.address, array[end].address) > 0 ? (start+1):end;
            if (this.compareAddress(deli.address, array[start].address) > 0) {
                return start+1;
            }
            return start;

        }
        if (this.compareAddress(deli.address, array[pivot].address) > 0) {
            return this.locationOf(deli, array, pivot, end);
        }
        else {
            return this.locationOf(deli, array, start, pivot);
        }
    }

    public isNewerJob(job: Job) {
        for (let ea of this._joblist) {
            if (ea._id == job._id) {
                //if the last_modify time newer than current one, then update, otherwise do nothing
                if ( job.last_modify <= ea.last_modify) {
                    //don't need to modify
                    return false;
                }
            
                return true;
            }
        }

        return true;
    }

    public addJob2List(deli: Job) {
        //sync the parcel list with the server
        //console.log("Add address : ", deli.address);
        for (let ea of this._joblist) {
            if (ea._id == deli._id) {
                //if the last_modify time newer than current one, then update, otherwise do nothing
                if ( ea.last_modify >= deli.last_modify) {
                    //don't need to modify
                    return;
                }

                //remove the item and add it later
                var index = this._joblist.indexOf(ea, 0);
                if (index > -1) {
                   this._joblist.splice(index, 1);
                }
            }
        }

        //add new
        if (0 == this._joblist.length) {
            //this._joblist.push(deli);
            this._joblist.splice(0,0,deli);
            return;
        }

        var sliceIndex = this.locationOf(deli, this._joblist, 0, this._joblist.length);
        this._joblist.splice(sliceIndex,0,deli);
        return;
    }

}