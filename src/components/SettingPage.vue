<script setup lang="ts">

</script>

<template>
  <div class="fixed  top-0 left-0 w-full h-full flex justify-center items-center">
    <div class="z-50
  w-[1200px] max-h-[90vh] h-[800px]  p-1 max-w-[70vw] bg-blue-200 rounded-xl flex overflow-hidden ">
      <div class="basis-1/4 min-w-44 max-w-64 p-3 bg-blue-300 rounded overflow-y-auto">

      </div>
      <div class="bg-blue-500 flex-grow p-3 rounded ml-1">
        <router-link to="/setting/about">to</router-link>
        <router-view></router-view>
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>