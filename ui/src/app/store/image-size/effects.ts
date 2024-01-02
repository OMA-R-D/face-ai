import { Injectable } from '@angular/core';
import { ofType } from '@ngrx/effects';
import { Actions, createEffect, } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { ImageSizeService } from 'src/app/core/image-size/image-size.service';
import { MaxImageSize } from 'src/app/data/interfaces/size.interface';
import { getMaxImageSize, getMaxImageSizeFail, getMaxImageSizeSuccess } from './actions';

@Injectable()
export class MaxImageSizeEffect {
  constructor(private maxSizeService: ImageSizeService, private actions: Actions, private store: Store<any>) {}

  //@createEffect({ dispatch: false })
  // Sudharshan Commented -03-JAN-24
  // getMaxSize$: Observable<MaxImageSize> = createEffect(() => this.actions.pipe(
  //   ofType(getMaxImageSize),
  //   switchMap(() =>
  //     this.maxSizeService.fetchMaxSize().pipe(
  //       filter(data => !!data),
  //       tap((data: MaxImageSize) => this.store.dispatch(getMaxImageSizeSuccess({ data }))),
  //       catchError(error => of(getMaxImageSizeFail({ error })))
  //     )
  //   )
  // ));
  
}
