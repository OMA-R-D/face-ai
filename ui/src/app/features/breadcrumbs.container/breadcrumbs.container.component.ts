/*
 * Copyright (c) 2020 the original author or authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { first, filter, tap } from 'rxjs/operators';

import { Application } from '../../data/interfaces/application';
import { Model } from '../../data/interfaces/model';
import { BreadcrumbsFacade } from '../breadcrumbs/breadcrumbs.facade';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';
import { ManageAppUsersDialog } from '../manage-app-users-dialog/manage-app-users.component';

@Component({
  selector: 'app-breadcrumbs-container',
  template: ` <app-breadcrumbs
    [model]="model$ | async"
    [app]="app$ | async"
    [hideControls]="hideControls"
    [modelSelected]="modelSelected"
    (usersList)="onUsersList($event)"
    (appSettings)="onAppSettings($event)"
  >
  </app-breadcrumbs>`,
  styleUrls: ['./breadcrumbs.container.component.scss'],
})
export class BreadcrumbsContainerComponent implements OnInit {
  app$: Observable<Application>;
  model$: Observable<Model>;
  modelSelected: boolean;
  @Input() hideControls: boolean;

  constructor(
    private breadcrumbsFacade: BreadcrumbsFacade,
    private translate: TranslateService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.app$ = this.breadcrumbsFacade.app$;
    this.model$ = this.breadcrumbsFacade.model$;
    this.modelSelected = !!this.route.snapshot.queryParams.model;
  }

  onAppSettings(app: Application): void {
    const fullName = app.owner.firstName + ' ' + app.owner.lastName;

    const dialog = this.dialog.open(EditDialogComponent, {
      panelClass: 'custom-mat-dialog',
      data: {
        type: this.translate.instant('applications.header.title'),
        label: this.translate.instant('applications.header.owner'),
        entityName: app.name,
        ownerName: fullName,
      },
    });
    dialog
      .afterClosed()
      .pipe(
        first(),
        filter(res => res),
        tap(res => {
          res.update ? this.breadcrumbsFacade.rename(res.name, app) : this.breadcrumbsFacade.delete(app);
        })
      )
      .subscribe();
  }

  onUsersList(app: Application): void {
    let appUsers;
    let currentUserId;

    const collectionSubs = this.breadcrumbsFacade.appUsers$.subscribe(users => (appUsers = users));

    const userSubs = this.breadcrumbsFacade.currentUserId$.subscribe(userId => (currentUserId = userId));

    const dialog = this.dialog.open(ManageAppUsersDialog, {
      data: {
        collection: appUsers,
        currentApp: app,
        currentUserId: currentUserId,
      },
    });

    const dialogSubs = dialog.afterClosed().subscribe(res => {
      const deletedUsers = res?.deletedUsers;
      const updatedUsers = res?.updatedUsers;
      const appId = res.appId;

      if (updatedUsers.length) {
        updatedUsers.forEach(user => {
          this.breadcrumbsFacade.updateUserRole(user.userId, user.role, appId);
        });
      }

      if (deletedUsers.length) {
        deletedUsers.forEach(user => {
          this.breadcrumbsFacade.deleteAppUsers(user.userId, appId);
        });
      }

      userSubs.unsubscribe();
      collectionSubs.unsubscribe();
      dialogSubs.unsubscribe();
    });
  }
}
