<script setup lang="ts">

import SideDock from "./SideDock.vue";
import ComponentsBoard from "./ComponentsBoard.vue";
import {useRouter} from "vue-router";
import {useApplicationStore} from "../stores/useApplicationStore.ts";
import {watch} from "vue";

const router = useRouter();
const store = useApplicationStore()
watch(() => store.setting.open, (new_val) => {
  if (new_val) {
    router.push("/setting")
  } else {
    router.push("/")
  }
});
</script>

<template>

  <div class="fixed">
    <router-view></router-view>
  </div>


  <div class="w-full h-full flex flex-row">
    <side-dock></side-dock>
    <components-board class="flex-grow"></components-board>
  </div>


</template>

<style scoped>

</style>