<template>
  <div id="container" :style="app.container.style">
    <component :is="app.scene"></component>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { setupApp, app } from "@/lib/app";

import StartScene from "@/scene/StartScene.vue";
import GameScene from "@/scene/GameScene.vue";
import ResultScene from "@/scene/ResultScene.vue";

export default defineComponent({
  name: "App",
  components: {
    StartScene,
    GameScene,
    ResultScene,
  },
  setup() {
    setupApp();

    return {
      app,
    };
  },
});
</script>

<style lang="scss" scoped>
#container {
  border: solid 1px green;
}
</style>
