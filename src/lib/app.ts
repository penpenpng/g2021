import { reactive } from "vue";

import { createGameState, Game } from "./game";

export interface AppState {
  scene: Scene;
  game: Game;
  container: {
    height: number;
    width: number;
    style: {
      height: string;
      width: string;
    };
  };
}

type Scene = "StartScene" | "GameScene" | "ResultScene";

export const app: AppState = reactive({
  scene: "GameScene",
  game: createGameState(),
  container: {
    height: 0,
    width: 0,
    style: {
      height: "0",
      width: "0",
    },
  },
});

export const setupApp = () => {
  const resizeContainer = () => {
    const height = window.innerHeight;
    const width = window.innerWidth;
    const container = app.container;
    const margin = 3;

    if ((height * 9) / 16 < width) {
      container.height = height - margin;
      container.width = (height * 9) / 16 - margin;
    } else {
      container.height = (width * 16) / 9 - margin;
      container.width = width - margin;
    }

    container.style.height = `${container.height}px`;
    container.style.width = `${container.width}px`;
  };

  window.addEventListener("resize", resizeContainer);

  resizeContainer();
};
