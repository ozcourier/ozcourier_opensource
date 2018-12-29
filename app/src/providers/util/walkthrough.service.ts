import { Injectable } from '@angular/core';

import { AppConfig } from '../../app/app.config';


@Injectable()
export class WalkThroughService {

  private _itemPreName: string = '';
  public _walkthroughStatus = {};
  public _slides = {
      'home': [
        {
          title: "Welcome to the OZCourier!",
          description: "All jobs show on map<br> clicks to get the job done.",
          image: "assets/imgs/home-1.png",
        },
        {
          title: "",
          description: "Click mark infor window to job detail<br> Or one click to navigate",
          image: "assets/imgs/home-2.png",
        },
        {
            title: "",
            description: "Job detail and Operations",
            image: "assets/imgs/home-3.png",
          },
      ],
      'add job': [
        {
          title: "",
          description: "Address input auto complete",
          image: "assets/imgs/addjob-1.png",
        },
      ],
      'job list': [
        {
          title: "",
          description: "Job shows in lines, easy to search and click",
          image: "assets/imgs/joblist-1.png",
        },
      ],
      'job history': [
        {
          title: "",
          description: "Query history by day and save to phone",
          image: "assets/imgs/jobhistory-1.png",
        },
      ],
      'my address': [
        {
          title: "",
          description: "If an address can't find in google map?",
          image: "assets/imgs/myaddr-01.png",
        },
        {
          title: "",
          description: "Or a big building block with lots of loading zone and departments,<br> how to identify them?",
          image: "assets/imgs/myaddr-01.png",
        },
        {
          title: "",
          description: "Make your address and easy to use",
          image: "assets/imgs/myaddr-1.png",
        },
        {
          title: "",
          description: "Set street name or department name",
          image: "assets/imgs/myaddr-2.png",
        },
        {
          title: "",
          description: "Set GEO address on map by click",
          image: "assets/imgs/myaddr-3.png",
        },
        {
          title: "",
          description: "finish the setting",
          image: "assets/imgs/myaddr-4.png",
        },
        {
          title: "",
          description: "Add job with my address",
          image: "assets/imgs/myaddr-5.png",
        },
        {
          title: "",
          description: "Job shows on map at the actual place you set with the notes too",
          image: "assets/imgs/myaddr-6.png",
        },
      ],
      'map settings local mode': [
        {
          title: "",
          description: "Select your delivery suburbs and adjust the map to good center and zoom",
          image: "assets/imgs/australia-1.png",
        },
      ],
  }

  constructor(private config: AppConfig) {
    this._itemPreName = this.config.localstorageheader + 'walkthrough-status';
    let walkthroughcontext = localStorage.getItem(this._itemPreName);
    if (walkthroughcontext) {
        // logged in so return true
        this._walkthroughStatus = JSON.parse(walkthroughcontext);
    }
    else{
        //first install, set all value to be default
        this._walkthroughStatus = {
            'home': true,
            'add job': true,
            'job list': true,
            'job history': true,
            'my address': true,
            'map settings local mode': true,
        };
    }
  }

  getPageWalkThroughStatus(pagename: string): boolean {
      if (pagename in this._walkthroughStatus){
          return this._walkthroughStatus[pagename];
      }
      else{
          return false;
      }
  }

  setPageWalkThroughStatus(pagename: string, status: boolean) {
    if (pagename in this._walkthroughStatus){
        this._walkthroughStatus[pagename] = status;
        localStorage.setItem(this._itemPreName, JSON.stringify(this._walkthroughStatus));
    }
    else{
        console.log("can't set walkthrough status by page name:", pagename);
    }
  }

  getSlides(pagename: string){
    if (pagename in this._slides){
        return this._slides[pagename];
    }
    else{
        return null;
    }
  }

}

