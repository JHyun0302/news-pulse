package com.newpulse.common;

import java.time.OffsetDateTime;

public record ApiErrorResponse(String code, String message, OffsetDateTime timestamp) {
}
