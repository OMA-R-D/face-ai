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
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { switchMap, filter, tap, catchError, withLatestFrom, map } from 'rxjs/operators';
import { ModelService } from 'src/app/core/model/model.service';
import { Statistics } from 'src/app/data/interfaces/statistics';
import { selectCurrentAppId } from '../application/selectors';
import { selectCurrentModelId } from '../model/selectors';
import { loadModelStatistics, loadModelStatisticsFail, loadModelStatisticsSuccess } from './actions';

@Injectable()
export class ModelStatisticsEffect {
  constructor(private actions: Actions, private modelService: ModelService, private store: Store<any>) {}

  //@createEffect({ dispatch: false })
  loadModelStatistics$ = createEffect(() => this.actions.pipe(
    ofType(loadModelStatistics),
    switchMap(data =>
      this.modelService.getStatistics(data.appId, data.modelId).pipe(
        filter(statistics => !!statistics),
        map((statistics: Statistics) => loadModelStatisticsSuccess(statistics)),
        catchError(error => of(loadModelStatisticsFail(error)))
      )
    )
  ));
}
