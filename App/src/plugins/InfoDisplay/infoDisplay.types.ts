/**
 * @fileOverview infoDisplay 插件类型定义
 */
import {DateTime} from "luxon";

interface infoItem {
    title: string;
    content: string;
    createDate: DateTime;
    deadDate: DateTime;
    tags: string[];
}

type infoItems = {
    [key: string]: infoItem;
}

interface infoGroup {
    title: string;
    items: string[];
}