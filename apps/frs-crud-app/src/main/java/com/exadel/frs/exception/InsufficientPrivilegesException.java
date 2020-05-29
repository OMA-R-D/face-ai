package com.exadel.frs.exception;

import static com.exadel.frs.handler.ExceptionCode.INSUFFICIENT_PRIVILEGES;

public class InsufficientPrivilegesException extends BasicException {

    public static final String MESSAGE = "Action not allowed for current user";

    public InsufficientPrivilegesException() {
        super(INSUFFICIENT_PRIVILEGES, MESSAGE);
    }
}