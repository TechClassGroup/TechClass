import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import json from "@eslint/json";

import css from "@eslint/css";
import {defineConfig} from "eslint/config";


export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        plugins: {js},
        extends: ["js/recommended"],
        rules: {
            // 强制使用分号
            semi: ["error", "always"],
            // 尾随逗号规则（多行时需要，单行时不需要）
            "comma-dangle": ["error", "always-multiline"],
            // 缩进规则（使用4个空格）
            indent: ["error", 4],
            // 引号风格（使用双引号）
            quotes: ["error", "double"],
            // 对象属性引号规则（必要时才加）
            "quote-props": ["error", "as-needed"],
            // 强制使用严格相等（=== 和 !==）
            eqeqeq: ["error", "always"],
            // 最大行长度
            "max-len": ["warn", {code: 100}],
            // 允许未使用的函数
            "no-unused-vars": ["error", {
                vars: "all",
                args: "after-used",
                ignoreRestSiblings: true,
                // 允许以下划线开头的未使用变量和参数
                varsIgnorePattern: "^_",
                argsIgnorePattern: "^_",
            }],
        },
    },
    {
        files: ["**/*.{vue,html}"],
        plugins: {js},
        extends: ["js/recommended"],
        rules: {
            // 强制使用分号
            semi: ["error", "always"],
            // 尾随逗号规则（多行时需要，单行时不需要）
            "comma-dangle": ["error", "always-multiline"],
            // 前端文件使用2个空格缩进
            indent: ["error", 2],
            // 引号风格（使用双引号）
            quotes: ["error", "double"],
            // 对象属性引号规则（必要时才加）
            "quote-props": ["error", "as-needed"],
            // 强制使用严格相等（=== 和 !==）
            eqeqeq: ["error", "always"],
            // 最大行长度
            "max-len": ["warn", {code: 100}],
            // 允许未使用的函数
            "no-unused-vars": ["error", {
                vars: "all",
                args: "after-used",
                ignoreRestSiblings: true,
                // 允许以下划线开头的未使用变量和参数
                varsIgnorePattern: "^_",
                argsIgnorePattern: "^_",
            }],
        },
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,vue}"],
        languageOptions: {globals: globals.browser},
    },
    tseslint.configs.recommended,
    pluginVue.configs["flat/essential"],
    {
        files: ["**/*.vue"],
        languageOptions: {parserOptions: {parser: tseslint.parser}},
    },
    {
        files: ["**/*.json"],
        plugins: {json},
        language: "json/json",
        extends: ["json/recommended"],
    },
    {
        files: ["**/*.jsonc"],
        plugins: {json},
        language: "json/jsonc",
        extends: ["json/recommended"],
    },
    {
        files: ["**/*.json5"],
        plugins: {json},
        language: "json/json5",
        extends: ["json/recommended"],
    },

    {
        files: ["**/*.css"],
        plugins: {css},
        language: "css/css",
        extends: ["css/recommended"],
    },
]);
