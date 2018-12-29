import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import { AppConfig } from '../../app/app.config';
import { User } from './index';

@Injectable()
export class UserService{
    
    private _itemPreName: string = '';
    private _localUser: User = null;

    //for login without register
    private _itemPreName_WithoutRegister: string = '';
    private _localUserWithoutRegister: User = null;

    private _userChangedSubscriber = new Subject<any>();
    private _defaultParcelDescriptions = ['box', 'letter','satchel','other','small','medium','large','white','grey', 'black', 'yellow','blue','red','green'];

    constructor(private http: HttpClient, private config: AppConfig) {
        this._itemPreName = this.config.localstorageheader + 'currentUser';
        this._itemPreName_WithoutRegister = this.config.localstorageheader + 'currentUser_withoutRegister';
        if (localStorage.getItem(this._itemPreName)) {
            // logged in so return true
            this._localUser = this.getUserFromLocalStorage();
            //console.log("aaa",this._localUser);
        }
        if (localStorage.getItem(this._itemPreName_WithoutRegister)) {
            // logged in so return true
            this._localUserWithoutRegister = this.getUserFromLocalStorage();
            //console.log("aaa",this._localUser);
        }
    }

    sendNotify(msg) {
        this._userChangedSubscriber.next(msg);
    }

    getNotify() {
        return this._userChangedSubscriber.asObservable();
    }

    getDefaultParcelDescriptions(){
        return this._defaultParcelDescriptions;
    }

    getAll() {
        return this.http.get(this.config.apiUrl + '/users', this.jwt());
    }

    getById(_id: string) {
        return this.http.get(this.config.apiUrl + '/users/' + _id, this.jwt());
    }

    create(user: User) {
        return this.http.post(this.config.apiUrl + '/users/register', user, this.jwt());
    }

    update(user: User) {
        console.log(user);
        return this.http.put<User>(this.config.apiUrl + '/users/' + user._id, user, this.jwt());
    }

    delete(_id: string) {
        return this.http.delete(this.config.apiUrl + '/users/' + _id, this.jwt());
    }

    public addNewArea(area: string[]) {
        return this.http.put(this.config.apiUrl + '/users/area/' + this._localUser._id, {"areas":area}, this.jwt());
    }

    public updateMapSetting(mapSetting) {
        return this.http.put(this.config.apiUrl + '/users/mapsetting/' + this._localUser._id, mapSetting, this.jwt());
    }

    public updateOptionSettings(settings) {
        return this.http.put(this.config.apiUrl + '/users/options/' + this._localUser._id, settings, this.jwt());
    }

    forgotPassword(email: string) {
        return this.http.post(this.config.apiUrl + '/users/forgot', {email:email.toLocaleLowerCase()});
    }

    resetPassword(email: string, token: string, password: string) {
        return this.http.post(this.config.apiUrl + '/users/reset', {email:email.toLocaleLowerCase(), token:token, password: password});
    }

    public getEcho(){
        let _id = '0';
        if (this._localUser)
        {
            _id = this._localUser._id;
        }
        return this.http.get(this.config.apiUrl + '/users/echo/' + _id, this.jwt());
    }

    public getLocalUserName(){
        return this._localUser.username;
    }

    public getUserFirstName(){
        return this._localUser.userdetail.firstname;
    }

    public getLocalUserId(){
        return this._localUser._id;
    }

    public getLocalUser(){
        return this._localUser;
    }

    public getUserFromLocalStorage(){
        var localUser: User;

        var currentUser = JSON.parse(localStorage.getItem(this._itemPreName));
        //console.log("user.service.ts->getLocalUser():",currentUser);
        localUser = new User;
        localUser._id = currentUser['_id'];

        localUser.username = currentUser['username'];
        localUser.expire_date = new Date(currentUser['expire_date']),
        localUser.userdetail = {
            firstname: currentUser['firstname'],
            lastname: currentUser['lastname'],
            emailaddress: currentUser['emailaddress']
        };
        localUser.company = {name:currentUser['company_name'],
                                country: currentUser['company_country'],
                                state:currentUser['company_state'],
                                city:currentUser['company_city'],
                                areas: currentUser['company_areas'],
                                mapSetting: {lat: currentUser['company_mapsetting_lat'],
                                            lng: currentUser['company_mapsetting_lng'],
                                            zoom: currentUser['company_mapsetting_zoom']}};
        //console.log(localUser);
        localUser.settings = {
            parcelDescriptions: 'settings_parcelDescriptions' in currentUser? currentUser['settings_parcelDescriptions']:this._defaultParcelDescriptions};
        return localUser;
    }

    public SaveUserToLocalStorage(user: any){
        console.log(user);
        //get
        let currentUser = JSON.parse(localStorage.getItem(this._itemPreName));

        currentUser['username'] = user.username;
        currentUser['expire_date'] =user.expire_date;
        currentUser['firstname'] = user.userdetail.firstname;
        currentUser['lastname'] = user.userdetail.lastname;
        currentUser['emailaddress'] = user.userdetail.emailaddress;

        currentUser['company_name'] = user.company.name,
        currentUser['company_country'] = user.company.country,
        currentUser['company_state'] = user.company.state,
        currentUser['company_city'] = user.company.city,
        currentUser['company_areas'] = user.company.areas,
        currentUser['company_mapsetting_lat'] =user.company.mapSetting.lat;
        currentUser['company_mapsetting_lng'] =user.company.mapSetting.lng;
        currentUser['company_mapsetting_zoom'] =user.company.mapSetting.zoom;

        currentUser['settings_parcelDescriptions'] = this._defaultParcelDescriptions;
        if ('settings' in user){
            if ('parcelDescriptions' in user.settings) {
                currentUser['settings_parcelDescriptions'] = user.settings.parcelDescriptions;
            }

        }

        console.log("Save user:", currentUser);

        //save
        localStorage.setItem(this._itemPreName, JSON.stringify(currentUser));

        return;
    }

    public saveLocalUser(user: any) {
        localStorage.setItem(this._itemPreName, JSON.stringify(user));
        this._localUser = this.getUserFromLocalStorage(); //set to the new user;
    }

    public clearLocalUser() {
        localStorage.removeItem(this._itemPreName);
        this._localUser = null; //set to the new user;
    }

    public syncUserFromDB() {
        if (!this._localUser) {return};

        this.getById(this._localUser._id)
            .subscribe(
                data => {
                    if (data) {
                        //console.log(data);
                        this.SaveUserToLocalStorage(data);
                        this._localUser = this.getUserFromLocalStorage();

                        this.sendNotify({msg:'user synced with db'});
                    }
                },
                error => {
                });
    }

    private toHttpParams(params) {
        return Object.getOwnPropertyNames(params)
                     .reduce((p, key) => p.set(key, params[key]), new HttpParams());
    }

    public jwt(param ?) {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem(this._itemPreName));
        if (currentUser && currentUser.token) {
            let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + currentUser.token });
            if (param) {
                //console.log("param is ", param);
                return { headers: headers, params: this.toHttpParams(param)};
            }
            else {
                return { headers: headers};
            }
        }
    }

    public setIsUserFirstLogin(isFirst: boolean) {
        localStorage.setItem('isFirstLogin', isFirst? '1':'0');
    }

    public getIsUserFirstLogin() {
        return localStorage.getItem('isFirstLogin') === '1'? true: false;
    }

    public UpdateLoginDate() {
        localStorage.setItem('currentUser_last_login', JSON.stringify({login_date: new Date()}));
    }

    public getLastLoginDate() {
        var lastLoginstr = localStorage.getItem('currentUser_last_login');
        if (lastLoginstr) {
            let lastLogin = JSON.parse(lastLoginstr);
            if ('login_date' in lastLogin){
                return lastLogin.login_date;
            }
        }

        return 0;
    }

}