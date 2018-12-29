import { NgModule }      from '@angular/core';


import { LogsService, ExtendAddressesService, WalkThroughService } from './index'

@NgModule({
  imports:      [ ],
  declarations: [ 
                ],
  providers:    [ 
    LogsService,
    ExtendAddressesService,
    WalkThroughService,
    ],
  exports: []
})
export class UtilModule {}
