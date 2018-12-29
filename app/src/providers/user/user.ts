export class UserDetail {
  firstname: string;
  lastname: string;
  emailaddress: string;
}

export class MapSetting {
  lat: Number;
  lng: Number;
  zoom: Number;
}

export class UserCompany {
  name: string;
  country: string;
  state: string;
  city: string;
  mapSetting: MapSetting;
  areas:[{area: string}];
}

export class UserSettings{
  parcelDescriptions: string[]
}

export class User {
  _id: string;
  username: string;
  password: string;
  userdetail: UserDetail;
  company: UserCompany;
  settings: UserSettings;
  expire_date: Date;
}
