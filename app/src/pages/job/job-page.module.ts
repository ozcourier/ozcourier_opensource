import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule }  from '@angular/common'

import { AddJobPage } from './add-job/add-job';
import { JobListPage } from './job-list/job-list';
import { JobDetailPage } from './job-detail/job-detail';
import { JobDetailInnerPage } from './share/job-detail-inner/job-detail-inner';
import { JobActionDeliveredPage } from './share/job-action/job-action-delivered/job-action-delivered';
import { JobActionOperationsPage } from './share/job-action/job-action-operations/job-action-operations';

@NgModule({
  declarations: [
    AddJobPage,
    JobListPage,
    JobDetailPage,
    JobActionDeliveredPage,
    JobActionOperationsPage,
    JobDetailInnerPage
  ],
  entryComponents: [
    AddJobPage,
    JobListPage,
    JobDetailPage,
    JobActionDeliveredPage,
    JobActionOperationsPage,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule,
    IonicPageModule.forChild(AddJobPage),
  ],
})
export class JobPageModule {}
