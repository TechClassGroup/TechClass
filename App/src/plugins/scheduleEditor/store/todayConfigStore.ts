/**
 * @fileOverview 今日日程的存储
 */
import {ref, watch} from "vue";
import {todayConfig} from "../scheduleEditorTypes";
import {generateTodayConfigByDate} from "../modules/todayConfig";
import {DateTime} from "luxon";
import {scheduleEditorProfile, waitForInit} from "./scheduleEditorProfile";
import Logger from "../../../modules/logger";
import logger from "../../../modules/logger";
import {PluginFs} from "../../../modules/pluginUtils";
import {createRetrySaveFunction} from "../../../modules/utils";

export const scheduleEditorTodayConfig = ref<todayConfig>({} as todayConfig);

function generateTodayConfig() {
    const date = DateTime.now();
    logger.trace("[scheduleEditor] 生成今日日程配置", date);
    const response = generateTodayConfigByDate(
        date,
        scheduleEditorProfile.value
    );
    if (response.isLoop) {
        Logger.error(
            "[generateTodayConfig] 出现了循环时间组",
            response.followTimeGroups
        );
        return;
    }
    logger.trace("[scheduleEditor] 生成今日日程配置成功");
    scheduleEditorTodayConfig.value = response.value as todayConfig;
}

function deserializeDateTime(parsedTodayConfig: todayConfig): todayConfig {
    // 处理datetime
    const schedule = parsedTodayConfig.schedule;
    // 这里不得不用any，不然IDE报错，超！
    schedule.forEach((item: any) => {
        if (item.startTime) {
            item.startTime = DateTime.fromISO(item.startTime);
        }
        if (item.endTime) {
            item.endTime = DateTime.fromISO(item.endTime);
        }
    });
    return parsedTodayConfig;
}

const saveTodayConfig = createRetrySaveFunction(
    () =>
        fileSystem!.writeFile(
            scheduleEditorTodayConfigName,
            JSON.stringify(scheduleEditorTodayConfig.value)
        ),
    {
        onSuccess: () => {
            Logger.trace("[scheduleEditor] 保存今日日程配置文件成功");
        },
        onRetry: (retryCount, maxRetries, error) => {
            Logger.warn(
                `[scheduleEditor] 保存今日日程配置文件失败,正在重试(${retryCount}/${maxRetries})`,
                error
            );
        },
        onError: (error) => {
            Logger.error(
                `[scheduleEditor] 保存今日日程配置文件失败,已重试5次`,
                error
            );
        },
    }
);
let fileSystem: PluginFs | null = null;
const scheduleEditorTodayConfigName = "scheduleEditor.todayConfig.json";
let todayConfigWatcher: null | ReturnType<typeof watch> = null;

export async function initTodayConfig(fs: PluginFs) {
    fileSystem = fs;
    let needGenerate = false;
    try {
        const todayConfigResponse = await fs.readFile(scheduleEditorTodayConfigName);
        const todayConfig = JSON.parse(todayConfigResponse) as todayConfig;
        type requiredKeys = keyof todayConfig;
        const keys: requiredKeys[] = ["schedule", "generateDate"];
        keys.forEach((key) => {
            if (!todayConfig[key]) {
                needGenerate = true;
                Logger.warn(`[scheduleEditor] 今日日程配置文件缺少${key}字段`);
            }
        });
        scheduleEditorTodayConfig.value = deserializeDateTime(todayConfig);
        Logger.trace("[scheduleEditor] 今日日程配置文件读取成功");
        console.log(scheduleEditorTodayConfig.value);
    } catch (e) {
        needGenerate = true;
        Logger.error("[scheduleEditor] 今日日程配置文件读取失败", e);
    }
    await waitForInit();
    if (needGenerate) {
        generateTodayConfig();
        saveTodayConfig();
    }
    todayConfigWatcher = watch(
        scheduleEditorTodayConfig,
        () => {
            saveTodayConfig();
        },
        {deep: true}
    );
}

export function clearTodayConfig() {
    saveTodayConfig();
    todayConfigWatcher?.stop();
    scheduleEditorTodayConfig.value = {} as todayConfig;
}
