import { FormControl } from '@angular/forms';

export class UserValidators {
    static userNameLenght(control: FormControl) {
        if (control.value.length<5){
            return {userNameLenght:true};
        }

        return null;
    }

}