# ozcourier opensource
This is an open source App for regular courier, it'll help courier to delivery parcels more efficient, easier and faster.

Requirement:
1. Ionic: 4.2.1  https://ionicframework.com
2. Nodejs
3. Google Map Account Key
4. Ipstack key

Configurations:
1: src/index.html
<script src="https://maps.googleapis.com/maps/api/js?v=3&key=[Your Key]]&libraries=places"></script>

2. src/app/app.config.ts
export class AppConfig {
    public readonly projectName = 'OZCourier - easy delivery'
    public readonly apiUrl = 'http://appopensource.ozcourier.com:5021';
    public readonly geoipUrl = 'http://api.ipstack.com/check?access_key=[your key]';
    public readonly localstorageheader = 'ozc-opensource'
};

Debug and Build Release:
Please refer Ionic manual

Copy right:
License: MIT
