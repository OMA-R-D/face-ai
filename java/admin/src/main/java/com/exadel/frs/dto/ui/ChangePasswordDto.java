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

package com.exadel.frs.dto.ui;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordDto {

    @NotEmpty(message = "Field oldPassword cannot be empty")
    @Size(min = 8, max = 255, message = "Field oldPassword must be more than 7 and less than 256 characters")
    private String oldPassword;

    @NotEmpty(message = "Field newPassword cannot be empty")
    @Size(min = 8, max = 255, message = "Field newPassword must be more than 7 and less than 256 characters")
    private String newPassword;
}
