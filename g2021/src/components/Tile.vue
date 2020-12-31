<template>
  <div :style="style">
    <template v-if="tile.tileType === 'PIPE'">
      <div
        @click="selectTile"
        class="tile pipe-tile"
        :class="{ selected: isSelectedTile }"
      >
        <div class="pipe-tile-piece" :style="upperLeftPieceStyle"></div>
        <div class="pipe-tile-piece" :style="upperRightPieceStyle"></div>
        <div class="pipe-tile-piece" :style="lowerLeftPieceStyle"></div>
        <div class="pipe-tile-piece" :style="lowerRightPieceStyle"></div>
      </div>
    </template>
    <template v-else>
      <template v-if="tile.objectType === 'COW'">
        <img class="tile image-tile" src="@/assets/eto_remake_ushi.png" />
      </template>
      <template v-if="tile.objectType === 'COW_SAUCE'">
        <img class="tile image-tile" src="@/assets/cooking_yakiniku_tare.png" />
      </template>
      <template v-if="tile.objectType === 'VEG_SAUCE'">
        <img class="tile image-tile" src="@/assets/dressing_sald.png" />
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from "vue";

import { app } from "@/lib/app";

import { PipeTile, Tile, Pipe, selectTile } from "@/lib/game";

const setupPipeTile = (props: Readonly<{ tile: Tile }>) => {
  const borderProp = (pipe: Pipe) => {
    if (!pipe.isOpen) return undefined;

    const color = {
      COW_SAUCE: "orange",
      VEG_SAUCE: "green",
      NONE: "gray",
    }[pipe.flow ?? "NONE"];

    return `solid ${color} 2px`;
  };

  const pipe = props.tile as PipeTile;

  return {
    upperLeftPieceStyle: computed(() => ({
      "border-right": borderProp(pipe.up),
      "border-bottom": borderProp(pipe.left),
    })),
    upperRightPieceStyle: computed(() => ({
      "border-left": borderProp(pipe.up),
      "border-bottom": borderProp(pipe.right),
    })),
    lowerLeftPieceStyle: computed(() => ({
      "border-top": borderProp(pipe.left),
      "border-right": borderProp(pipe.down),
    })),
    lowerRightPieceStyle: computed(() => ({
      "border-top": borderProp(pipe.right),
      "border-left": borderProp(pipe.down),
    })),
    isSelectedTile: computed(() => {
      const [row1, col1] = app.game.field.selected ?? [-1, -1];
      const [row2, col2] = props.tile.position;

      return row1 === row2 && col1 == col2;
    }),
    selectTile: () => selectTile(app.game, props.tile.position),
  };
};

export default defineComponent({
  name: "Tile",
  props: {
    tile: {
      type: Object as PropType<Tile>,
      required: true,
    },
  },
  setup(props) {
    return {
      style: computed(() => {
        const size = app.container.width / app.game.field.columns;

        return {
          width: `${size}px`,
          height: `${size}px`,
        };
      }),
      ...setupPipeTile(props),
    };
  },
});
</script>

<style lang="scss" scoped>
.tile {
  width: 100%;
  height: 100%;
}

.image-tile {
  object-fit: contain;
}

.pipe-tile {
  cursor: pointer;

  &.selected {
    border: solid 1px yellow;
  }

  &:not(.selected):hover {
    border: solid 1px cadetblue;
  }
}

.pipe-tile-piece {
  display: inline-block;
  vertical-align: bottom;
  width: 50%;
  height: 50%;
}
</style>
