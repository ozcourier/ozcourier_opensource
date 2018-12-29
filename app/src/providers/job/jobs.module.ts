import { NgModule } from '@angular/core';


import { JobsService, GeoIP } from './index';
import { JobsLocalStorageService, JobsServerStorageService } from './index';

@NgModule({
	declarations: [],
	imports: [],
    providers:    [ 
        JobsService,
        GeoIP,
        JobsLocalStorageService,
        JobsServerStorageService
    ],
	exports: []
})
export class JobsModule {}
