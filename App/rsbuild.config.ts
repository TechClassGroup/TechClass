import {defineConfig} from '@rsbuild/core';
import {pluginVue} from "@rsbuild/plugin-vue";
import { pluginHtmlMinifierTerser } from 'rsbuild-plugin-html-minifier-terser'
export default defineConfig({
    plugins: [pluginVue(),pluginHtmlMinifierTerser()],
    html: {
        template: 'index.html',
    },
    source: {
        entry: {
            index: './src/index.ts'
        }
    },
    server: {
        port: 1420,
    },
    tools: {
        rspack: {
            watchOptions: {
                ignored: ['**/node_modules', '**/src-tauri/**', '**/.git/**']
            }
        }
    }

});