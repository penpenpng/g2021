export interface Game {
  field: {
    tiles: Tile[][];
    rows: number;
    columns: number;
    cowPos: Position;
    cowSaucePos: Position;
    vegSaucePos: Position;
    selected?: Position;
  };
  canOperate: boolean;
  picture: Picture;
  stage: number;
  score: number;
  countdown: number;
  isOver: boolean;
}

export type Position = [number, number];

export type Tile = PipeTile | ObjectTile;
export type ObjectType = "COW" | "COW_SAUCE" | "VEG_SAUCE";
export type Flow = "COW_SAUCE" | "VEG_SAUCE";
export type Picture = "COW" | "VEG" | undefined;

export interface ObjectTile {
  tileType: "OBJECT";
  tileId: number;
  position: Position;
  objectType: ObjectType;
}

export interface PipeTile {
  tileType: "PIPE";
  tileId: number;
  position: Position;
  up: Pipe;
  down: Pipe;
  left: Pipe;
  right: Pipe;
}

export interface Pipe {
  isOpen: boolean;
  flow?: Flow;
}

const randomId = () => Math.floor(Math.random() * 100000);

const wait = async (millisec: number) =>
  new Promise((resolve): number => setTimeout(resolve, millisec));

export const createGameState = (): Game => {
  const rows = 6;
  const columns = 6;
  const countdown = 60;

  return {
    field: {
      tiles: [...Array(rows)].map((_, row) =>
        [...Array(columns)].map((_, col) => ({
          tileType: "PIPE",
          tileId: randomId(),
          position: [row, col],
          up: {
            isOpen: false,
          },
          down: {
            isOpen: false,
          },
          left: {
            isOpen: false,
          },
          right: {
            isOpen: false,
          },
        }))
      ),
      rows,
      columns,
      cowPos: [-1, -1],
      cowSaucePos: [-1, -1],
      vegSaucePos: [-1, -1],
    },
    picture: undefined,
    canOperate: true,
    stage: 0,
    score: 0,
    countdown,
    isOver: false,
  };
};

const goToNextStage = (game: Game): void => {
  const { rows, columns } = game.field;

  // Increment stage count
  game.stage += 1;

  // Generate pipe-tiles
  const createRandomPipeTile = (position: Position): PipeTile => {
    const randomBool = () => Math.random() < 0.5;

    return {
      tileType: "PIPE",
      tileId: randomId(),
      position,
      up: {
        isOpen: randomBool(),
      },
      down: {
        isOpen: randomBool(),
      },
      left: {
        isOpen: randomBool(),
      },
      right: {
        isOpen: randomBool(),
      },
    };
  };

  for (let row = 0; row < rows; row++)
    for (let col = 0; col < columns; col++)
      game.field.tiles[row][col] = createRandomPipeTile([row, col]);

  // Generate object-tiles
  const createObjectTile = (position: Position, objectType: ObjectType) => ({
    tileType: "OBJECT" as const,
    tileId: randomId(),
    position,
    objectType,
  });

  const randomY = () => Math.floor(Math.random() * rows);
  const randomX = () => Math.floor(Math.random() * columns);

  let row: number;
  let col: number;

  while (
    (([row, col] = [randomX(), randomY()]),
    game.field.tiles[row][col].tileType !== "PIPE")
  );
  game.field.tiles[row][col] = createObjectTile([row, col], "COW");
  game.field.cowPos = [row, col];

  while (
    (([row, col] = [randomX(), randomY()]),
    game.field.tiles[row][col].tileType !== "PIPE")
  );
  game.field.tiles[row][col] = createObjectTile([row, col], "COW_SAUCE");
  game.field.cowSaucePos = [row, col];

  while (
    (([row, col] = [randomX(), randomY()]),
    game.field.tiles[row][col].tileType !== "PIPE")
  );
  game.field.tiles[row][col] = createObjectTile([row, col], "VEG_SAUCE");
  game.field.vegSaucePos = [row, col];
};

export const start = (game: Game): void => {
  game.isOver = false;
  game.canOperate = true;

  const timer = setInterval(() => {
    game.countdown--;
    if (game.countdown <= 0) {
      game.countdown = 0;
      clearInterval(timer);
      game.isOver = true;
      game.canOperate = false;
    }
  }, 1000);

  goToNextStage(game);
};

const fillFlowIfReachs = (
  game: Game
): {
  reachsCowSauce: boolean;
  reachsVegSauce: boolean;
} => {
  type Move = "UP" | "DOWN" | "RIGHT" | "LEFT";
  type Memo = {
    prev?: Position;
    lastMove?: Move;
  }[][];

  const { rows, columns } = game.field;
  const createMemo = (): Memo =>
    [...Array(rows)].map(() =>
      [...Array(columns)].map(() => ({
        prev: undefined,
        lastMove: undefined,
      }))
    );

  const dig = (
    pos: Position,
    memo: Memo,
    flow: Flow,
    prev?: Position,
    lastMove?: Move,
    isNotStart?: boolean
  ): boolean => {
    const [row, col] = pos;
    const tile = game.field.tiles?.[row]?.[col];

    if (tile === undefined) return false;
    if (memo[row][col].prev !== undefined) return false;
    if (isNotStart && tile.tileType === "OBJECT" && tile.objectType !== "COW")
      return false;

    memo[row][col] = { prev, lastMove };

    const upPos: Position = [row - 1, col];
    const downPos: Position = [row + 1, col];
    const leftPos: Position = [row, col - 1];
    const rightPos: Position = [row, col + 1];

    if (tile.tileType === "PIPE") {
      const canMoveUp = () => {
        const [row, col] = upPos;
        const nextTile = game.field.tiles?.[row]?.[col];

        return (
          tile.up.isOpen &&
          nextTile !== undefined &&
          (nextTile.tileType !== "PIPE" || nextTile.down.isOpen)
        );
      };
      const canMoveDown = () => {
        const [row, col] = downPos;
        const nextTile = game.field.tiles?.[row]?.[col];

        return (
          tile.down.isOpen &&
          nextTile !== undefined &&
          (nextTile.tileType !== "PIPE" || nextTile.up.isOpen)
        );
      };
      const canMoveLeft = () => {
        const [row, col] = leftPos;
        const nextTile = game.field.tiles?.[row]?.[col];

        return (
          tile.left.isOpen &&
          nextTile !== undefined &&
          (nextTile.tileType !== "PIPE" || nextTile.right.isOpen)
        );
      };
      const canMoveRight = () => {
        const [row, col] = rightPos;
        const nextTile = game.field.tiles?.[row]?.[col];

        return (
          tile.right.isOpen &&
          nextTile !== undefined &&
          (nextTile.tileType !== "PIPE" || nextTile.left.isOpen)
        );
      };

      if (canMoveUp() && dig(upPos, memo, flow, pos, "UP", true)) return true;
      if (canMoveDown() && dig(downPos, memo, flow, pos, "DOWN", true))
        return true;
      if (canMoveLeft() && dig(leftPos, memo, flow, pos, "LEFT", true))
        return true;
      if (canMoveRight() && dig(rightPos, memo, flow, pos, "RIGHT", true))
        return true;
      return false;
    }

    if (tile.objectType === flow && prev === undefined) {
      // here is start
      const canMoveUp = () => {
        const [row, col] = upPos;
        const nextTile = game.field.tiles?.[row]?.[col];

        return (
          nextTile !== undefined &&
          (nextTile.tileType !== "PIPE" || nextTile.down.isOpen)
        );
      };
      const canMoveDown = () => {
        const [row, col] = downPos;
        const nextTile = game.field.tiles?.[row]?.[col];

        return (
          nextTile !== undefined &&
          (nextTile.tileType !== "PIPE" || nextTile.up.isOpen)
        );
      };
      const canMoveLeft = () => {
        const [row, col] = leftPos;
        const nextTile = game.field.tiles?.[row]?.[col];

        return (
          nextTile !== undefined &&
          (nextTile.tileType !== "PIPE" || nextTile.right.isOpen)
        );
      };
      const canMoveRight = () => {
        const [row, col] = rightPos;
        const nextTile = game.field.tiles?.[row]?.[col];

        return (
          nextTile !== undefined &&
          (nextTile.tileType !== "PIPE" || nextTile.left.isOpen)
        );
      };
      if (canMoveUp() && dig(upPos, memo, flow, pos, "UP", true)) return true;
      if (canMoveDown() && dig(downPos, memo, flow, pos, "DOWN", true))
        return true;
      if (canMoveLeft() && dig(leftPos, memo, flow, pos, "LEFT", true))
        return true;
      if (canMoveRight() && dig(rightPos, memo, flow, pos, "RIGHT", true))
        return true;
      return false;
    }

    return tile.objectType === "COW";
  };

  const fill = (pos: Position, memo: Memo, flow: Flow): void => {
    const [row, col] = pos;
    const prev = memo[row][col].prev;

    if (prev === undefined) return;

    const lastMove = memo[row][col].lastMove as Move;
    const tile = game.field.tiles[row][col];

    if (lastMove === "UP") {
      if (tile.tileType == "PIPE") tile.down.flow = flow;
      const prevTile = game.field.tiles[prev[0]][prev[1]];
      if (prevTile.tileType === "PIPE") prevTile.up.flow = flow;
    }
    if (lastMove === "DOWN") {
      if (tile.tileType == "PIPE") tile.up.flow = flow;
      const prevTile = game.field.tiles[prev[0]][prev[1]];
      if (prevTile.tileType === "PIPE") prevTile.down.flow = flow;
    }
    if (lastMove === "RIGHT") {
      if (tile.tileType == "PIPE") tile.left.flow = flow;
      const prevTile = game.field.tiles[prev[0]][prev[1]];
      if (prevTile.tileType === "PIPE") prevTile.right.flow = flow;
    }
    if (lastMove === "LEFT") {
      if (tile.tileType == "PIPE") tile.right.flow = flow;
      const prevTile = game.field.tiles[prev[0]][prev[1]];
      if (prevTile.tileType === "PIPE") prevTile.left.flow = flow;
    }

    fill(prev, memo, flow);
  };

  let memo = createMemo();
  const ret = {
    reachsCowSauce: false,
    reachsVegSauce: false,
  };

  ret.reachsVegSauce = dig(game.field.vegSaucePos, memo, "VEG_SAUCE");
  if (ret.reachsVegSauce) {
    console.log("veg", memo);
    fill(game.field.cowPos, memo, "VEG_SAUCE");
    return ret;
  }

  memo = createMemo();
  ret.reachsCowSauce = dig(game.field.cowSaucePos, memo, "COW_SAUCE");
  if (ret.reachsCowSauce) {
    console.log("cow", memo);
    fill(game.field.cowPos, memo, "COW_SAUCE");
  }

  return ret;
};

const swapTiles = (game: Game, pos1: Position, pos2: Position) => {
  const [row1, col1] = pos1;
  const [row2, col2] = pos2;
  const tiles = game.field.tiles;

  const isAdjacent =
    (row1 === row2 && Math.abs(col1 - col2) === 1) ||
    (col1 === col2 && Math.abs(row1 - row2) === 1);
  const isSelectable = (tile: Tile | undefined): boolean =>
    tile !== undefined && tile.tileType === "PIPE";

  if (
    !isAdjacent ||
    !isSelectable(tiles[row1][col1]) ||
    !isSelectable(tiles[row2][col2])
  )
    // Do Nothing
    return;

  // Swap
  [tiles[row1][col1], tiles[row2][col2]] = [
    tiles[row2][col2],
    tiles[row1][col1],
  ];

  // But positions be kept
  [tiles[row1][col1].position, tiles[row2][col2].position] = [
    tiles[row2][col2].position,
    tiles[row1][col1].position,
  ];

  // Check gameover
  const { reachsCowSauce, reachsVegSauce } = fillFlowIfReachs(game);
  console.log("check", { reachsCowSauce, reachsVegSauce });

  const pictureShown: Picture = reachsVegSauce
    ? "VEG"
    : reachsCowSauce
    ? "COW"
    : undefined;

  if (pictureShown !== undefined) {
    Promise.resolve().then(async () => {
      game.canOperate = false;

      await wait(500);

      game.picture = pictureShown;

      await wait(500);

      game.canOperate = true;
      game.picture = undefined;
      game.countdown += 3;

      if (pictureShown == "VEG") game.countdown = 0;

      goToNextStage(game);
    });
  }
};

export const selectTile = (game: Game, position: Position): void => {
  const [row, col] = position;

  if (!game.canOperate) return;
  if (game.field.tiles[row][col].tileType !== "PIPE") return;

  if (game.field.selected) {
    swapTiles(game, position, game.field.selected);
    game.field.selected = undefined;
  } else {
    game.field.selected = position;
  }
};
