# ozcourier opensource
This is an open source App for regular courier, it'll help courier to delivery parcels more efficient, easier and faster.

Requirement:<br>
1. Ionic: 4.2.1  https://ionicframework.com
2. Nodejs
3. Google Map Account Key
4. Ipstack key

Configurations:<br>
1: src/index.html
<script src="https://maps.googleapis.com/maps/api/js?v=3&key=[Your Key]]&libraries=places"></script>
<br><br>
2. src/app/app.config.ts<br>
export class AppConfig {<br>
    public readonly projectName = 'OZCourier - easy delivery'<br>
    public readonly apiUrl = 'http://appopensource.ozcourier.com:5021';<br>
    public readonly geoipUrl = 'http://api.ipstack.com/check?access_key=[your key]';<br>
    public readonly localstorageheader = 'ozc-opensource'<br>
};<br>

Debug and Build Release:<br>
Please refer Ionic manual

Copy right:<br>
License: MIT
