package com.newpulse.common;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalTime;
import org.junit.jupiter.api.Test;

class TimeWindowTest {

    @Test
    void 일반_DND_구간은_시작_포함_종료_제외로_판단한다() {
        TimeWindow window = TimeWindow.parse("09:00-18:00");

        assertThat(window.contains(LocalTime.of(9, 0))).isTrue();
        assertThat(window.contains(LocalTime.of(17, 59))).isTrue();
        assertThat(window.contains(LocalTime.of(18, 0))).isFalse();
        assertThat(window.contains(LocalTime.of(8, 59))).isFalse();
    }

    @Test
    void 자정을_넘는_DND_구간을_판단한다() {
        TimeWindow window = TimeWindow.parse("23:00-11:00");

        assertThat(window.contains(LocalTime.of(23, 0))).isTrue();
        assertThat(window.contains(LocalTime.of(1, 0))).isTrue();
        assertThat(window.contains(LocalTime.of(10, 59))).isTrue();
        assertThat(window.contains(LocalTime.of(11, 0))).isFalse();
        assertThat(window.contains(LocalTime.of(12, 0))).isFalse();
    }

    @Test
    void 미설정_DND는_항상_false다() {
        TimeWindow window = TimeWindow.parse("-");

        assertThat(window.contains(LocalTime.of(0, 0))).isFalse();
        assertThat(window.enabled()).isFalse();
    }
}
