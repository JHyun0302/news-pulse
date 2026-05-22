package com.newpulse.common;

import java.time.LocalTime;
import java.time.format.DateTimeParseException;

public record TimeWindow(LocalTime start, LocalTime end, boolean enabled) {

    private static final String UNSET = "-";

    public static TimeWindow unset() {
        return new TimeWindow(null, null, false);
    }

    public static TimeWindow of(LocalTime start, LocalTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("dnd start and end are required");
        }
        return new TimeWindow(start, end, true);
    }

    public static TimeWindow parse(String raw) {
        if (raw == null || raw.isBlank() || UNSET.equals(raw.trim())) {
            return unset();
        }
        String[] parts = raw.trim().split("-");
        if (parts.length != 2) {
            throw new IllegalArgumentException("dnd_time must use HH:mm-HH:mm");
        }
        try {
            return of(LocalTime.parse(parts[0].trim()), LocalTime.parse(parts[1].trim()));
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("dnd_time must use HH:mm-HH:mm", e);
        }
    }

    public boolean contains(LocalTime time) {
        if (!enabled) {
            return false;
        }
        if (start.equals(end)) {
            return true;
        }
        if (end.isAfter(start)) {
            return !time.isBefore(start) && time.isBefore(end);
        }
        return !time.isBefore(start) || time.isBefore(end);
    }

    public String startText() {
        return enabled ? start.toString() : null;
    }

    public String endText() {
        return enabled ? end.toString() : null;
    }
}
