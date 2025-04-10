import {sidebar} from "vuepress-theme-hope";

export default sidebar({
    "/": [
        "",
        "portfolio",
        {
            text: "应用",
            icon: "laptop-code",
            prefix: "app/",
            link: "app/",
            children: "structure",
        },
        {
            text: "文档",
            icon: "book",
            prefix: "guide/",
            children: "structure",
        },
        {
            text: "幻灯片",
            icon: "person-chalkboard",
            link: "https://ecosystem.vuejs.press/zh/plugins/markdown/revealjs/demo.html",
        },
    ],
});
