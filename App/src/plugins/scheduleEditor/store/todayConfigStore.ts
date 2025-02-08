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

function generateTodayConfig() {
    const date = DateTime.now();
    const response = generateTodayConfigByDate(
        date,
        scheduleEditorProfile.value
    );
    if (response.isLoop) {
        Logger.error("[generateTodayConfig] 出现了循环时间组", response.followTimeGroups);
        return;
    }
    scheduleEditorTodayConfig.value = response.value;

}

export async function initTodayConfig() {
    await waitForInit();
    generateTodayConfig();

}

export function clearTodayConfig() {
    scheduleEditorTodayConfig.value = {} as todayConfig;
}
