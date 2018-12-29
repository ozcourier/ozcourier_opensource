import { Injectable } from '@angular/core';

import { AppConfig } from '../../app/app.config';
import { UserService } from './user.service'

@Injectable()
export class AuthGuard {
    private _itemPreName: string = '';
    constructor(private config: AppConfig, private _userService: UserService) {
        this._itemPreName = this.config.localstorageheader + 'currentUser';
     }

    public isLogined(){
        if (localStorage.getItem(this._itemPreName)){

            //need to login because it expired.
            /*
            if (-1 === this._userService.willExpireSoon()){
                return false;
            }
            */

            var today = new Date();
            let lastLoginDate = this._userService.getLastLoginDate();
            //console.log(today);
            //console.log(lastLoginDate);
            if (0 == lastLoginDate){
                return false;
            }

            var lastDate = new Date(lastLoginDate);

            if (today.getMonth() == lastDate.getMonth()) {
                return true;
            }
            else {
                if (today.getDate() <= lastDate.getDate()){
                    return true;
                }
            }

            return false;
        }

        return false;
    }
}