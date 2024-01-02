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
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of as observableOf, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { SnackBarService } from 'src/app/features/snackbar/snackbar.service';

import { AuthService } from '../../core/auth/auth.service';
import { Routes } from '../../data/enums/routers-url.enum';
import { resetUserInfo } from '../userInfo/action';
import {
  clearUserToken,
  logIn,
  logInFail,
  logInSuccess,
  logOut,
  signUp,
  signUpFail,
  signUpSuccess,
  changePassword,
  changePasswordSuccess,
  changePasswordFail,
  refreshToken,
  recoveryPassword,
  recoveryPasswordFail,
  recoveryPasswordSuccess,
  resetPassword,
  resetPasswordFail,
  resetPasswordSuccess,
  confirmEmailMessage,
} from './action';
import { Store } from '@ngrx/store';
import { selectQueryParams } from '../router/selectors';
import { selectDemoPageAvailability } from '../demo/selectors';
import { GranTypes } from 'src/app/data/enums/gran_type.enum';
import { selectMailStatus } from '../mail-service/selectors';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class AuthEffects {
  constructor(
    private actions: Actions,
    private authService: AuthService,
    private router: Router,
    private snackBarService: SnackBarService,
    private store: Store<any>
  ) {}

  // Listen for the 'LOGIN' action
  //@createEffect()
  logIn$ = createEffect(() =>this.actions.pipe(
    ofType(logIn),
    switchMap(action =>
      this.authService.logIn(action.email, action.password, GranTypes.Password).pipe(
        map(() => logInSuccess()),
        catchError(error => observableOf(logInFail(error)))
      )
    )
  ));

  // Listen for the 'LOGIN' action
  //@createEffect({ dispatch: false })
  refreshToken$ = createEffect(() =>this.actions.pipe(
    ofType(refreshToken),
    switchMap(action => this.authService.refreshToken(action.grant_type).pipe(catchError(error => observableOf(logInFail(error)))))
  ));

  // Listen for the 'LogInSuccess' action
  //@createEffect({ dispatch: false })
  logInSuccess$ = createEffect(() => this.actions.pipe(
    ofType(logInSuccess),
    withLatestFrom(
      this.store.select(selectQueryParams),
      this.store.select(selectDemoPageAvailability)
    ),
    switchMap(([, queryParams, isDemoPageAvailable]) => {
      const { redirect } = queryParams;
      const navigateTo = isDemoPageAvailable ? Routes.CreateApplication : redirect || Routes.Home;
      return of(navigateTo);
    }),
    tap(navigateTo => this.router.navigateByUrl(navigateTo))
  ));

  //@createEffect({ dispatch: false })
  showError$ = createEffect(() =>this.actions.pipe(
    ofType(logInFail, signUpFail),
    tap(action => {
      if (action.error && action.error.error_description === 'Bad credentials') {
        this.snackBarService.openNotification({ messageText: 'auth.incorrect_credentials', type: 'error' });
      } else if (action.error && action.error.code === 4) {
        this.snackBarService.openNotification({ messageText: 'auth.already_in_use', type: 'error' });
      } else if (action.error.message) {
        this.snackBarService.openNotification({ messageText: action.error.message, type: 'error' });
      } else {
        this.snackBarService.openHttpError(action.error);
      }
    })
  ));

  //@createEffect({ dispatch: false })
  showSuccess$ = createEffect(() =>this.actions.pipe(
    ofType(signUpSuccess),
    tap(action => {
      const message = action.confirmationNeeded ? 'auth.new_account_confirm_email' : 'auth.new_account_login';
      this.snackBarService.openNotification({ messageText: message });
    })
  ));

  //@createEffect()
  signUp$: Observable<any> = createEffect(() =>this.actions.pipe(
    ofType(signUp),
    switchMap(payload =>
      this.authService.signUp(payload.firstName, payload.password, payload.email, payload.lastName, payload.isAllowStatistics).pipe(
        map(res => signUpSuccess({ confirmationNeeded: res.status === 200, email: payload.email, password: payload.password })),
        catchError(error => observableOf(signUpFail(error)))
      )
    )
  ));

  //@createEffect()
  signUpSuccess$: Observable<any> = createEffect(() =>this.actions.pipe(
    ofType(signUpSuccess),
    withLatestFrom(this.store.select(selectMailStatus)),
    map(([action, mailStatus]) =>
      mailStatus.mailServiceEnabled ? confirmEmailMessage() : logIn({ email: action.email, password: action.password })
    )
  ));

  //@createEffect({ dispatch: false })
  confirmEmailMessage$ = createEffect(() =>this.actions.pipe(
    ofType(confirmEmailMessage),
    tap(
      () => this.router.navigateByUrl(Routes.UpdatePassword) // need new page saying that email was sent tp conirm)
    )
  ));

  //@createEffect({ dispatch: false })
  signUpFailure$: Observable<any> = createEffect(() =>this.actions.pipe(ofType(signUpFail)));

  //@createEffect()
  logOut$: Observable<any> = createEffect(() =>this.actions.pipe(
    ofType(logOut),
    switchMap(() => {
      this.router.navigateByUrl(Routes.Login);

      return [clearUserToken(), resetUserInfo()];
    })
  ));

  //@createEffect({ dispatch: false })
  clearUserToken$: Observable<any> = createEffect(() =>this.actions.pipe(
    ofType(clearUserToken),
    switchMap(() => this.authService.clearUserToken())
  ));

  //@createEffect()
  changePassword$: Observable<any> = createEffect(() =>this.actions.pipe(
    ofType(changePassword),
    switchMap(payload =>
      this.authService.changePassword(payload.oldPassword, payload.newPassword).pipe(
        map(() => changePasswordSuccess()),
        catchError(error => observableOf(changePasswordFail({ error: error })))
      )
    )
  ));

  //@createEffect({ dispatch: false })
  changePasswordSuccess$: Observable<any> = createEffect(() =>this.actions.pipe(
    ofType(changePasswordSuccess),
    tap(() => this.snackBarService.openNotification({ messageText: 'auth.change_password_success' }))
  ));

  //@createEffect({ dispatch: false })
  changePasswordFailure$: Observable<any> = createEffect(() =>this.actions.pipe(ofType(changePasswordFail)));

  //@createEffect({ dispatch: false })
  recoveryPassword$ = createEffect(() => this.actions.pipe(
    ofType(recoveryPassword),
    switchMap(action =>
      this.authService.recoveryPassword(action.email).pipe(
        map(() => recoveryPasswordSuccess()), // Dispatch success action
        catchError(error => of(recoveryPasswordFail({ error }))) // Dispatch failure action with error
      )
    )
  ));
  //@createEffect({ dispatch: false })
  recoveryPasswordSuccess$ = createEffect(() =>this.actions.pipe(
    ofType(recoveryPasswordSuccess),
    tap(() => {
      const message = 'recovery.email_check';
      this.snackBarService.openNotification({ messageText: message });
    })
  ));

  //@createEffect({ dispatch: false })
  recoveryPasswordFail$ = createEffect(() =>this.actions.pipe(
    ofType(recoveryPasswordFail),
    tap(error => this.snackBarService.openHttpError(error as any))
  ));

  //@createEffect({ dispatch: false })
  resetPassword$ = createEffect(() => this.actions.pipe(
    ofType(resetPassword),
    switchMap(action =>
      this.authService.updatePassword(action.password, action.token).pipe(
        map(() => resetPasswordSuccess()), // Dispatch success action
        catchError(error => of(resetPasswordFail({ error }))) // Dispatch failure action with error
      )
    )
  ));

  //@createEffect({ dispatch: false })
  resetPasswordSuccess$ = createEffect(() =>this.actions.pipe(
    ofType(resetPasswordSuccess),
    tap(() => {
      this.router.navigateByUrl(Routes.Login);
      const message = 'auth.change_password_success';
      this.snackBarService.openNotification({ messageText: message });
    })
  ));

  //@createEffect({ dispatch: false })
  resetPasswordFail$ = createEffect(() =>this.actions.pipe(
    ofType(resetPasswordFail),
    tap(error => this.snackBarService.openHttpError(error as any))
  ));
}
