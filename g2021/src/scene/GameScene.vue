<template>
  <div class="indicator">
    <div class="score">スコア: {{ app.game.score }}</div>
    <div class="timer">残り時間: {{ app.game.countdown }}</div>
  </div>

  <template v-if="app.game.picture">
    <div
      class="picture-container"
      :style="{
        width: app.container.style.width,
        height: app.container.style.width,
      }"
    >
      <img
        class="picture"
        v-if="app.game.picture === 'COW'"
        src="@/assets/niku_yakiniku.png"
      />
      <img
        class="picture"
        v-if="app.game.picture === 'VEG'"
        src="@/assets/salad.png"
      />
    </div>
  </template>

  <template v-else>
    <div class="stage">
      <template v-for="cols in field.tiles">
        <template v-for="tile in cols" :key="tile.tileId">
          <Tile class="tile" :tile="tile" />
        </template>
      </template>
    </div>
  </template>

  <div class="desc">
    牛に焼肉のタレをかけて焼肉を作ろう！ドレッシングをかけるとサラダになってしまうから要注意だ！
  </div>

  <div v-show="app.game.isOver">
    <div>
      おわり！！！！！
    </div>
    <button class="btn" @click="tweet">
      つぶやく
    </button>
    <button class="btn" @click="retry">
      もっかい
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

import { app } from "@/lib/app";
import { start } from "@/lib/game";

import Tile from "@/components/Tile.vue";

export default defineComponent({
  name: "GameScene",
  components: {
    Tile,
  },
  setup() {
    start(app.game);

    return {
      app,
      field: computed(() => app.game.field),
      tweet: () => {
        const message = `わたしはおせちのために ${app.game.score} 匹の丑を焼肉にしました`;
        (window as any).open().location.href = `https://twitter.com/intent/tweet?text=${encodeURI(
          message
        )}`;
      },
      retry: () => start(app.game),
    };
  },
});
</script>

<style lang="scss" scoped>
.tile {
  display: inline-block;
  vertical-align: bottom;
  border: solid 0.5px lightgrey;
}

.picture {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.indicator {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  font-size: large;
}

.btn {
  margin: 5px;
}

.desc {
  margin: 10px;
}
</style>
