export class ExtendAddress {
  _id: string;
  driver_id: string;
  name: string;
  notes: string;
  lat: number;
  lng: number;
}


export class ExtendAddrList {
  _exAddrs: ExtendAddress[] = [];

  private comparPrex(strprex, strwhole){
      var i: number;
      for (i=0; i<strprex.length; i++){
        if (strprex.charAt(i) != strwhole.charAt(i)){
          break;
        }
      }
      if (i == strprex.length){
          //console.log("compare:", strprex, strwhole," return succ");
        return true;
      }

      //console.log("compare:", strprex, strwhole," return fail ", i);
      return false;
  }

  public clear() {
    this._exAddrs = [];
  }

  public add(extendAddr: ExtendAddress) {
    //check whether it's duplicated
    for (let ea of this._exAddrs){
      if (ea.name == extendAddr.name){
        return;
      }
    }

    //this._exAddrs.push(extendAddr);
    if (0 == this._exAddrs.length) {
      //this._joblist.push(deli);
      this._exAddrs.splice(0,0,extendAddr);
      return;
    }

    var i = 0;
    for (let ea of this._exAddrs){
        if (ea.name > extendAddr.name) {
            break;
        }
        i = i + 1;
    }

    this._exAddrs.splice(i,0,extendAddr);
  }

  public remove(_id: string) {
    //this._exAddrs.push(extendAddr);
    var i = 0;
    for (let ea of this._exAddrs){
        if (ea._id === _id) {
          this._exAddrs.splice(i,1);
          break;
        }
        i = i + 1;
    }
  }

  public showStreet() {
    console.log(this._exAddrs);
  }

  public searchStreet(addr: string){
    
    var searchStr = addr.trim().toLowerCase();
    let ret = this._exAddrs.filter(x => this.comparPrex(searchStr,x.name.toLowerCase()));
    //console.log(searchStr);
    //console.log(this._exAddrs);
    //console.log(ret);
    //console.log(ret);
    return ret;
  }

  public getExtendAddrs() {
    return this._exAddrs;
  }

}
  