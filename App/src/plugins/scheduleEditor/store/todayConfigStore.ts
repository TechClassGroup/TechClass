/**
 * @fileOverview 今日日程的存储
 */
import {ref, Ref, watch} from "vue";
import {todayConfig} from "../scheduleEditor.types";
import {generateTodayConfigByDate} from "../modules/todayConfig";
import {DateTime} from "luxon";
import {scheduleEditorProfile, waitForInit} from "./scheduleEditorProfile";
import Logger from "../../../core/utils/logger";
import logger from "../../../core/utils/logger";
import {createRetrySaveFunction, sleepUntil} from "../../../core/utils/utils";
import {localFileSystem} from "../../../core/plugins-systems/pluginApis/fileSystem";

export const scheduleEditorTodayConfig: Ref<todayConfig> = ref<todayConfig>(
    {} as todayConfig
);
// 是否循环引用？
// 给展示用的
export let isTodayConfigLoop = ref(false);

export function generateTodayConfig() {
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
        isTodayConfigLoop.value = true;
    } else {
        logger.trace("[scheduleEditor] 生成今日日程配置成功");
        logger.debug("[scheduleEditor] 生成今日日程配置", response.value);
        isTodayConfigLoop.value = false;
    }

    scheduleEditorTodayConfig.value = response.value as todayConfig;
}

// 我不传any，你就报错，我传了any，你又说我不应该传any，我也是醉了
function deserializeDateTime(parsedTodayConfig: any): todayConfig {
    // 处理datetime
    const schedule = parsedTodayConfig.schedule;
    // 遍历对象的值
    Object.values(schedule).forEach((item: any) => {
        if (item.startTime) {
            item.startTime = DateTime.fromISO(item.startTime);
        }
        if (item.endTime) {
            item.endTime = DateTime.fromISO(item.endTime);
        }
    });
    // 处理 generateDate
    if (parsedTodayConfig.generateDate) {
        parsedTodayConfig.generateDate = DateTime.fromISO(
            parsedTodayConfig.generateDate
        );
    }
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
let fileSystem: localFileSystem | null = null;
const scheduleEditorTodayConfigName = "scheduleEditor.todayConfig.json";
let todayConfigWatcher: null | ReturnType<typeof watch> = null;
let regenerateTimer: { cancel: () => void } | null = null;

function setupRegenerateTimer() {
    if (regenerateTimer) {
        regenerateTimer.cancel();
    }
    // 计算下一个午夜时间点
    const nextMidnight = DateTime.now().plus({days: 1}).startOf("day");
    logger.trace(
        "[scheduleEditor] 设置下一次课表生成时间",
        nextMidnight.toISO()
    );

    // 如果现在已经过了午夜，立即生成
    if (DateTime.now() > nextMidnight) {
        logger.info("[scheduleEditor] 已过午夜时间点，立即生成今日课表");
        generateTodayConfig();
        saveTodayConfig();
        setupRegenerateTimer();
        return;
    }

    const {promise, cancel} = sleepUntil(nextMidnight);
    regenerateTimer = {cancel};

    promise.then(() => {
        logger.info("[scheduleEditor] 到达午夜时间点，开始生成今日课表");
        generateTodayConfig();
        saveTodayConfig();
        // 设置下一个定时器
        setupRegenerateTimer();
    });
}

export async function initTodayConfig(fs: localFileSystem) {
    fileSystem = fs;
    let needGenerate = false;
    try {
        const todayConfigResponse = await fs.readFile(
            scheduleEditorTodayConfigName
        );
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
    } catch (e) {
        needGenerate = true;
        Logger.error("[scheduleEditor] 今日日程配置文件读取失败", e);
    }
    await waitForInit();
    // 非今日检查
    if (
        !needGenerate &&
        !scheduleEditorTodayConfig.value.generateDate
            .startOf("day")
            .equals(DateTime.now().startOf("day"))
    ) {
        logger.trace("[scheduleEditor] 非今日配置，重新生成");
        needGenerate = true;
    }
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
    // 设置定时器
    setupRegenerateTimer();
}

export function clearTodayConfig() {
    saveTodayConfig();
    todayConfigWatcher?.stop();
    // 清理定时器
    if (regenerateTimer) {
        regenerateTimer.cancel();
        regenerateTimer = null;
    }
    scheduleEditorTodayConfig.value = {} as todayConfig;
}
