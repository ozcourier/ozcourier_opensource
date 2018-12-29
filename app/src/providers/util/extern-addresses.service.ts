import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs/Observable";

import { AppConfig } from '../../app/app.config';
import { UserService } from '../user/index';
import { ExtendAddress, ExtendAddrList } from './extend-address';

@Injectable()
export class ExtendAddressesService {

  private _itemPreName: string = '';
  private _extendAddrList: ExtendAddrList = new ExtendAddrList();
  private _isInitialized : boolean = false;
  private _isLoadFromServer : boolean = false;

  constructor(private http: HttpClient, private config: AppConfig, private _userService: UserService) {
    this._itemPreName = this.config.localstorageheader + 'extendaddr_';
   }

  public createRadomNewId(){
    let date:Date = new Date();
    var newId = date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds() + '-' + date.getMilliseconds() + '-' + Math.floor(Math.random()*(1000));
    return newId;
  }

  save2Local(data: any) {
    //console.log("save2Local() called");
    localStorage.setItem(this._itemPreName, JSON.stringify(data));
  }

  getExtendAddrsbyLocal() {

    console.log("getExtendAddrsbyLocal() called");
    this._extendAddrList.clear();
    let user_id = this._userService.getLocalUserId();

    let retContent = JSON.parse(localStorage.getItem(this._itemPreName));
    if (retContent) {
      console.log(retContent);
        if ('extend_addresses' in retContent){
            let extendAddrs = retContent['extend_addresses'];
            for (let ea of extendAddrs) {
              if (ea.driver_id == user_id){
                this._extendAddrList.add(ea);
              }
            }
        }
    }

    this._isInitialized = true;
  }

  getExtendAddrsFromServer() {
    return Observable.create(observer => {
      try {
        console.log("getExtendAddrsFromServer() start:");
        if (this._isLoadFromServer) {
          //already called from server, so do nothing
          observer.next(this._extendAddrList.getExtendAddrs());
          observer.complete();
          return;
        }

        this._extendAddrList.clear();
        var url = this.config.apiUrl + '/extaddr/' + this._userService.getLocalUserId();
        this.http.get(url, this._userService.jwt())
            .subscribe(
                data => {
                    if (data) {
                      console.log(data);
                      if ('extend_addresses' in data){
                        for (let st of data['extend_addresses']){
                          //for (let st of data){
                            let newAddr = new ExtendAddress();
                            newAddr._id = st._id;
                            newAddr.driver_id = st.driver_id;
                            newAddr.name = st.name;
                            newAddr.notes = st.notes;
                            newAddr.lat = st.lat;
                            newAddr.lng = st.lng;
      
                            this._extendAddrList.add(newAddr);
                          }
                      }
                    }

                  this._isLoadFromServer = true;
                  this.save2Local({'extend_addresses': this._extendAddrList.getExtendAddrs()});
                  observer.next(this._extendAddrList.getExtendAddrs());
                  observer.complete();
                },
                error => {
                  observer.complete();
                });
      } catch (error) {
          observer.error('error getGeocoding' + error);
          observer.complete();
      }
      });
    }

  getExtendAddressList() {
    if (!this._isInitialized){
        this.getExtendAddrsbyLocal();
    }

    return this._extendAddrList.getExtendAddrs();
  }

  searchExtendAddress(addr: string) {
    if (!this._extendAddrList){
        this.getExtendAddrsbyLocal();
    }

    return this._extendAddrList.searchStreet(addr);
  }

  public addExtendAddr(extendAddr: ExtendAddress){
    //add the parcel to the datebase
    this.http.post(this.config.apiUrl + '/extaddr/add', extendAddr, this._userService.jwt())
      .subscribe(
        data => {
          console.log(data);
          //need to update the id because extenAddr using a temp id
          //this._extendAddrList.remove(extendAddr._id);
          extendAddr._id = data['_id'];
          this._extendAddrList.add(extendAddr);
          this.save2Local({'extend_addresses': this._extendAddrList.getExtendAddrs()});
        },
        error => {
          console.log("Error","add address to server failed: " + extendAddr.name);
        });
  }

  public removeExtendAddr(extendAddr: ExtendAddress){

    var newUrl = this.config.apiUrl + '/extaddr/delete/' + this._userService.getLocalUserId() + '/' + extendAddr._id;
    this.http.delete(newUrl, this._userService.jwt())
      .subscribe(
        data => {
          console.log(data);
          //need to update the id because extenAddr using a temp id
        },
        error => {
          console.log("Error","remove address to server failed: " + extendAddr.name);
        });

    this._extendAddrList.remove(extendAddr._id);
    this.save2Local({'extend_addresses': this._extendAddrList.getExtendAddrs()});
  }

  public updateExtendAddress(extendAddr: ExtendAddress) {

    console.log(extendAddr);
    this._extendAddrList.remove(extendAddr._id);
    this._extendAddrList.add(extendAddr);
    this.save2Local({'extend_addresses': this._extendAddrList.getExtendAddrs()});

    //update to server
    let newUrl = this.config.apiUrl + '/extaddr/update/' + extendAddr._id;
    this.http.put(newUrl, extendAddr, this._userService.jwt())
      .subscribe(
        data => {
            //this.sendNotify({type: JobServiceSubscriberTypes.updateOne, msg:'', job: job, returnId:''});
        },
        error => {
            console.log("update extend address to server failed, need to handle it:" + JSON.stringify(extendAddr));
      });
  }

  public clearLocalStorage(){
    this._extendAddrList.clear();
    this.save2Local({'extend_addresses': this._extendAddrList.getExtendAddrs()});
  }

}
