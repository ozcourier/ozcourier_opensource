import { NgModule }      from '@angular/core';


import { UserService, AuthGuard, AuthenticationService } from './index'

@NgModule({
  imports:      [ ],
  declarations: [ 
                ],
  providers:    [ 
                AuthGuard,
                AuthenticationService,
                UserService,
                ],
  exports: []
})
export class UsersModule {}
