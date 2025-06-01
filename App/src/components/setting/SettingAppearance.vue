<script lang="ts" setup>
import {Theme, useApplicationStore} from "../../stores/useApplicationStore";
import SettingItem from "../utils/SettingItem.vue";
import TcSelect from "../../UI/TcSelect.vue";

const store = useApplicationStore();
</script>

<template>
  <div class="p-4">
    <div class="flex items-center mb-6">
      <h1 class="text-2xl font-medium leading-8 text-title">外观设置</h1>
    </div>

    <div class="space-y-4">
      <setting-item>
        <template #title>基础颜色</template>
        <template #description> 设置应用的基础颜色</template>

        <TcSelect
            v-model="store.storage.appearance.theme"
            :options="[
                        { label: '默认', value: Theme.auto },
                        { label: '浅色', value: Theme.light },
                        { label: '深色', value: Theme.dark },
                    ]"
            required
        >
        </TcSelect>
      </setting-item>
    </div>
  </div>
</template>

<style scoped></style>
