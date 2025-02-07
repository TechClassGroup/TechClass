/**
 * @fileOverview 今日日程的存储
 */
import {ref} from "vue";
import {todayConfig} from "../scheduleEditorTypes";
import {generateTodayConfigByDate} from "../modules/todayConfig";
import {DateTime} from "luxon";
import {scheduleEditorProfile, waitForInit} from "./scheduleEditorProfile";
import Logger from "../../../modules/logger";

export const scheduleEditorTodayConfig = ref<todayConfig>({} as todayConfig);

export async function initTodayConfig() {
    const date = DateTime.now();
    await waitForInit();

    const response = generateTodayConfigByDate(
        date,
        scheduleEditorProfile.value
    );
    if (!response.isLoop && response.value) {
        scheduleEditorTodayConfig.value = response.value;
    }
    Logger.info(scheduleEditorTodayConfig.value);
}

export function clearTodayConfig() {
    scheduleEditorTodayConfig.value = {} as todayConfig;
}
