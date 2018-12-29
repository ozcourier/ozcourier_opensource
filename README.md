# ozcourier opensource
This is an open source App for regular courier, it'll help courier to delivery parcels more efficient, easier and faster.

## Demo:

On Google Play Shop, Search OZCourier, you may download it and try.
[OZCourier on Google Play Shop](https://play.google.com/store/apps/details?id=au.com.ozcourier.global&hl=en): 

## Requirement:
* Ionic: 4.2.1  [Ionic Website](https://ionicframework.com)
* Nodejs
* Google Map Account Key
* Ipstack key

## Installation plugins:
```
1. install googlemaps / need to before add platform
ionic cordova plugin add cordova-plugin-googlemaps --variable API_KEY_FOR_ANDROID="[Your Key]" --no-fetch
npm install --save @ionic-native/google-maps

2. add platform
ionic cordova platform add android

4. install app version
ionic cordova plugin add cordova-plugin-app-version
npm install --save @ionic-native/app-version

5. install date picker
ionic cordova plugin add cordova-plugin-datepicker
npm install --save @ionic-native/date-picker

6. install GEOLocation
ionic cordova plugin add cordova-plugin-geolocation --variable GEOLOCATION_USAGE_DESCRIPTION="To locate you"
npm install --save @ionic-native/geolocation

7. install sqlite storage
ionic cordova plugin add cordova-sqlite-storage
npm install --save @ionic-native/sqlite
```

## Configurations:
```
1: src/index.html<br>
<script src="https://maps.googleapis.com/maps/api/js?v=3&key=[Your Key]]&libraries=places"></script>

2. src/app/app.config.ts
export class AppConfig {
    public readonly projectName = 'OZCourier - easy delivery'
    public readonly apiUrl = 'http://appopensource.ozcourier.com:5021';
    public readonly geoipUrl = 'http://api.ipstack.com/check?access_key=[your key]';
    public readonly localstorageheader = 'ozc-opensource'
};
```

## Debug and Build Release:
```Please refer Ionic manual```

## Other bug fix:
```
1. location buttong not works
in node_modules/@ionic-native/google-maps/index.d.ts
add line: myLocation?: boolean; 
export interface GoogleMapOptions {
    /**
     * MapType
     */

    mapType?: MapType;
    controls?: {
        /**
         * Turns the compass on or off.
         */
        compass?: boolean;
        /**
         * Turns the myLocation picker on or off. If turns on this button, the application displays a permission dialog to obtain the geolocation data.
         */
        myLocationButton?: boolean;
        myLocation?: boolean;
In loading map, add options:
    myLocation: true
```


#### License: MIT
