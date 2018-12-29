export class Address {
    faddr: string;    //formated address: for example: 11 braemar st, sunnybank hills QLD 4109, Australia
    addr: string;
    city: string;
    lat: number;
    lng: number;
}

export class AddressDetail {
    addr: string;
    city: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
}

export class  AddressFunc {
    

    public static getFullAddress (addr: Address): string {
        try {
            console.log(addr);
            return addr.faddr;
            //for to get the GEO address, don't use the post code, because it'll get wrong GEO if the suburb is not correct, 
            // for example: 540 logan road, holland park 4121 will get wrong GEO . but 540 logan road, holland park will correct .
            /*
            if (('' != addr.post) && ('0' != addr.post)){
                addrstr = addrstr + ' ' + addr.post;
            }
            */
        } catch (error) {
            return '';
        }
    }

    public static getShortAddress (addr: Address): string {
        try {
            return addr.addr + ', ' + addr.city;
        } catch (error) {
            return '';
        }
    }

    public static getBriefAddress (addr: Address) {
        try {
            return addr.addr;
        } catch (error) {
            return '';
        }
    }

    public static resetAddress(addr: Address) {
        try {
            addr.faddr = '';
            addr.addr = '';
            addr.city = '';
            addr.lat = 0;
            addr.lng = 0;
        } catch (error) {
            
        }
    }

    public static resetAddressDetail(addr: AddressDetail) {
        try {
            addr.addr = '';
            addr.city = '';
            addr.state = '';
            addr.country = '';
            addr.lat = 0;
            addr.lng = 0;
        } catch (error) {
            
        }
    }
    

    public static isGeoValid(addr: Address): boolean {
        return !((0 == addr.lat) && (0 == addr.lng));
    }
}


