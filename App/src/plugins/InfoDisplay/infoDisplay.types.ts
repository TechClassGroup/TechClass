/**
 * @fileOverview infoDisplay 插件类型定义
 */
import {DateTime} from "luxon";

interface infoItem {
    content: string;
    createDate: DateTime;
    deadDate: DateTime;
    fatherGroupIds: string[];
    tags: string[];
}

type infoItems = {
    [key: string]: infoItem;
}

interface infoGroup {
    title: string;
    items: string[];
}