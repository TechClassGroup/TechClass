import {Plugin} from "../plugin.type";

/**
 * 工具类型：从Plugin类中提取泛型参数T
 */
type ExtractPluginGenericType<P> = P extends Plugin<infer T> ? T : never;

/**
 * 组件属性接口
 * 定义了传递给插件组件的属性
 * 自动提取Plugin的泛型参数
 *
 * @description 该接口用于定义插件组件的props类型。当组件被渲染时，会接收到一个plugin对象，
 * 该对象包含插件的所有信息和配置。使用此接口可以保证类型安全，并提供正确的代码提示。
 *
 * @example
 * // 在插件组件中使用:
 * const props = defineProps<componentProps<MyPluginClass>>();
 *
 * // 方法1: 直接在模板中使用props (推荐，最简单)
 * // <template>
 * //   <div v-if="props.plugin.storage.content.someProp">
 * //     {{ props.plugin.storage.content.anotherProp }}
 * //   </div>
 * // </template>
 *
 * // 方法2: 使用computed获取响应式引用
 * // import { computed } from 'vue';
 * // const config = computed(() => props.plugin.storage!.content);
 * // 在模板中使用: {{ config.value.someProp }}
 *
 * // 方法3: 使用toRef创建响应式引用
 * // import { toRef } from 'vue';
 * // const config = toRef(() => props.plugin.storage!.content);
 * // 在模板中使用: {{ config.value.someProp }}
 *
 * // 方法4: 使用reactive包装
 * // import { reactive } from 'vue';
 * // const config = reactive(props.plugin.storage!.content);
 * // 在模板中使用: {{ config.someProp }}
 *
 * @note 当在模板中直接使用props对象时(如 v-if="props.plugin.storage.content.someProp")，
 * Vue会自动保持响应性。但如果将props对象的属性解构到本地变量(如 const config = props.plugin.storage.content)，
 * 响应性会丢失。此时需要使用以下方法之一来保持响应性:
 * 1. 直接在模板中使用props对象(推荐)
 * 2. 使用computed创建计算属性
 * 3. 使用toRef创建响应式引用
 * 4. 使用reactive包装对象
 *
 * @typeParam P - 插件类型，必须继承自Plugin基类
 */
export interface componentProps<P extends Plugin> {
    /** 插件实例 */
    plugin: P & {
        storage: {
            // 使用提取出的泛型类型
            content: ExtractPluginGenericType<P>;
        } | null;
    };
}