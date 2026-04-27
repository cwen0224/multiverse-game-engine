import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ACTION_TYPES, CAMERA_PRESETS, STAGE_UNITS } from "../types/boardTypes";
import { addLog, clearLogs, getLogsSnapshot, subscribeLogs } from "../store/logStore";

const BoardContext = createContext(null);

const createEntity = (id, name, type, ownerId, visual, properties = {}) => ({
  id,
  metadata: {
    name,
    type,
    ownerId,
  },
  visual: {
    x: 500,
    y: 500,
    height: 0,
    rotation: 0,
    revealed: false,
    ...visual,
  },
  properties: {
    HP: 12,
    XP: 0,
    ATK: 4,
    Mana: 2,
    ...properties,
  },
  states: [],
});

const createInitialEntityMap = () =>
  new Map([
    [
      "hero-card",
      {
        ...createEntity(
          "hero-card",
          "Astra Vanguard",
          "MONSTER",
          "PLAYER_1",
          { x: 500, y: 500, height: 0, rotation: 0, revealed: true },
          { HP: 12, ATK: 4, Mana: 2, XP: 0 }
        ),
      },
    ],
    [
      "p1-hand-1",
      {
        ...createEntity("p1-hand-1", "Nova Knight", "MONSTER", "PLAYER_1", { revealed: true }, { HP: 8, ATK: 3 }),
      },
    ],
    [
      "p1-hand-2",
      {
        ...createEntity("p1-hand-2", "Aether Burst", "SPELL", "PLAYER_1", { revealed: true }, { Mana: 3, Cost: 2 }),
      },
    ],
    [
      "p1-hand-3",
      {
        ...createEntity("p1-hand-3", "Iron Bulwark", "LAND", "PLAYER_1", { revealed: true }, { DEF: 6 }),
      },
    ],
    [
      "p1-hand-4",
      {
        ...createEntity("p1-hand-4", "Sapphire Drake", "MONSTER", "PLAYER_1", { revealed: true }, { HP: 7, ATK: 5 }),
      },
    ],
    [
      "op-hand-1",
      {
        ...createEntity("op-hand-1", "Unknown", "HIDDEN", "PLAYER_2", { revealed: false }),
      },
    ],
    [
      "op-hand-2",
      {
        ...createEntity("op-hand-2", "Unknown", "HIDDEN", "PLAYER_2", { revealed: false }),
      },
    ],
    [
      "op-hand-3",
      {
        ...createEntity("op-hand-3", "Unknown", "HIDDEN", "PLAYER_2", { revealed: false }),
      },
    ],
  ]);

const INITIAL_PLAYER_HAND = ["p1-hand-1", "p1-hand-2", "p1-hand-3", "p1-hand-4"];
const INITIAL_OPPONENT_HAND = ["op-hand-1", "op-hand-2", "op-hand-3"];

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const isValidStageCoordinate = (value) => isNumber(value) && value >= 0 && value <= STAGE_UNITS;
const isPropertyValue = (value) => typeof value === "number" || typeof value === "string";

function parseAction(actionJSON) {
  if (typeof actionJSON === "string") {
    try {
      return JSON.parse(actionJSON);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }
  if (!actionJSON || typeof actionJSON !== "object") {
    throw new Error("Action must be an object or a JSON string.");
  }
  return actionJSON;
}

function validateActionShape(action) {
  if (typeof action.type !== "string" || !action.type) {
    throw new Error("Action type must be a non-empty string.");
  }
  if (typeof action.entityId !== "string" || !action.entityId) {
    throw new Error("Action entityId must be a non-empty string.");
  }
}

export function BoardProvider({ children }) {
  const [cameraMode, setCameraMode] = useState("TACTICAL");
  const [entities, setEntities] = useState(createInitialEntityMap());
  const [playerHand, setPlayerHand] = useState(INITIAL_PLAYER_HAND);
  const [opponentHand, setOpponentHand] = useState(INITIAL_OPPONENT_HAND);
  const [selectedEntityId, setSelectedEntityId] = useState("hero-card");
  const [logs, setLogs] = useState(getLogsSnapshot());

  useEffect(() => subscribeLogs(setLogs), []);

  const updateEntity = (entityId, updater) => {
    setEntities((prevMap) => {
      const current = prevMap.get(entityId);
      if (!current) {
        throw new Error(`Entity "${entityId}" does not exist.`);
      }
      const nextMap = new Map(prevMap);
      nextMap.set(entityId, updater(current));
      return nextMap;
    });
  };

  const updateEntityVisual = (entityId, nextVisualPatch) => {
    setEntities((prevMap) => {
      const current = prevMap.get(entityId);
      if (!current) {
        throw new Error(`Entity "${entityId}" does not exist.`);
      }

      const currentVisual = current.visual;
      const nextVisual = { ...currentVisual, ...nextVisualPatch };
      const xDiff = Math.abs((nextVisual.x ?? currentVisual.x) - currentVisual.x);
      const yDiff = Math.abs((nextVisual.y ?? currentVisual.y) - currentVisual.y);
      const sameHeight = nextVisual.height === currentVisual.height;
      const sameRotation = nextVisual.rotation === currentVisual.rotation;
      const sameReveal = nextVisual.revealed === currentVisual.revealed;
      if (xDiff < 0.1 && yDiff < 0.1 && sameHeight && sameRotation && sameReveal) {
        return prevMap;
      }

      const nextMap = new Map(prevMap);
      nextMap.set(entityId, { ...current, visual: nextVisual });
      return nextMap;
    });
  };

  const executeAction = (actionJSON) => {
    let action = null;
    try {
      action = parseAction(actionJSON);
      validateActionShape(action);
      const { entityId } = action;
      if (!entities.has(entityId)) {
        throw new Error(`Entity "${entityId}" not found.`);
      }

      if (action.type === ACTION_TYPES.MOVE_ENTITY) {
        const { x, y, height = 0 } = action.payload ?? {};
        if (!isValidStageCoordinate(x) || !isValidStageCoordinate(y)) {
          throw new Error(`MOVE_ENTITY x/y out of range: (${x}, ${y}). Expected 0-${STAGE_UNITS}.`);
        }
        if (!isNumber(height)) {
          throw new Error("MOVE_ENTITY payload.height must be a finite number.");
        }
        updateEntityVisual(entityId, { x, y, height });
      } else if (action.type === ACTION_TYPES.SET_VISUAL) {
        const nextVisual = action.payload ?? {};
        if (nextVisual.x !== undefined && !isValidStageCoordinate(nextVisual.x)) {
          throw new Error(`SET_VISUAL payload.x must be between 0 and ${STAGE_UNITS}.`);
        }
        if (nextVisual.y !== undefined && !isValidStageCoordinate(nextVisual.y)) {
          throw new Error(`SET_VISUAL payload.y must be between 0 and ${STAGE_UNITS}.`);
        }
        if (nextVisual.height !== undefined && !isNumber(nextVisual.height)) {
          throw new Error("SET_VISUAL payload.height must be a finite number.");
        }
        if (nextVisual.rotation !== undefined && !isNumber(nextVisual.rotation)) {
          throw new Error("SET_VISUAL payload.rotation must be a finite number.");
        }
        if (nextVisual.revealed !== undefined && typeof nextVisual.revealed !== "boolean") {
          throw new Error("SET_VISUAL payload.revealed must be boolean.");
        }
        updateEntityVisual(entityId, nextVisual);
      } else if (action.type === ACTION_TYPES.SET_PROPERTY) {
        const { key, value } = action.payload ?? {};
        if (typeof key !== "string" || !key) {
          throw new Error("SET_PROPERTY payload.key must be a non-empty string.");
        }
        if (!isPropertyValue(value)) {
          throw new Error("SET_PROPERTY payload.value must be a number or string.");
        }
        updateEntity(entityId, (current) => ({
          ...current,
          properties: { ...current.properties, [key]: value },
        }));
      } else if (action.type === ACTION_TYPES.PATCH_PROPERTIES) {
        const patch = action.payload ?? {};
        if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
          throw new Error("PATCH_PROPERTIES payload must be an object.");
        }
        for (const [key, value] of Object.entries(patch)) {
          if (!key || !isPropertyValue(value)) {
            throw new Error(`PATCH_PROPERTIES invalid key/value pair for "${key}".`);
          }
        }
        updateEntity(entityId, (current) => ({
          ...current,
          properties: { ...current.properties, ...patch },
        }));
      } else if (action.type === ACTION_TYPES.SET_STATES) {
        const states = action.payload?.states;
        if (!Array.isArray(states) || states.some((state) => typeof state !== "string")) {
          throw new Error("SET_STATES payload.states must be string array.");
        }
        updateEntity(entityId, (current) => ({ ...current, states: [...new Set(states)] }));
      } else if (action.type === ACTION_TYPES.ADD_STATE) {
        const { state } = action.payload ?? {};
        if (typeof state !== "string" || !state) {
          throw new Error("ADD_STATE payload.state must be a non-empty string.");
        }
        updateEntity(entityId, (current) => ({
          ...current,
          states: current.states.includes(state) ? current.states : [...current.states, state],
        }));
      } else if (action.type === ACTION_TYPES.REMOVE_STATE) {
        const { state } = action.payload ?? {};
        if (typeof state !== "string" || !state) {
          throw new Error("REMOVE_STATE payload.state must be a non-empty string.");
        }
        updateEntity(entityId, (current) => ({
          ...current,
          states: current.states.filter((item) => item !== state),
        }));
      } else if (action.type === ACTION_TYPES.REVEAL_ENTITY) {
        const { revealed } = action.payload ?? {};
        if (typeof revealed !== "boolean") {
          throw new Error("REVEAL_ENTITY payload.revealed must be boolean.");
        }
        updateEntity(entityId, (current) => ({
          ...current,
          visual: { ...current.visual, revealed },
        }));
      } else {
        throw new Error(`Unsupported action type "${action.type}".`);
      }

      addLog("INFO", `${action.type} executed`, action);
      return true;
    } catch (error) {
      addLog("ERROR", error.message, action);
      throw error;
    }
  };

  const playCardFromHand = (entityId, visual) => {
    const { x, y } = visual ?? {};
    if (!isValidStageCoordinate(x) || !isValidStageCoordinate(y)) {
      throw new Error(`playCardFromHand invalid target coordinate: (${x}, ${y}).`);
    }
    setPlayerHand((prev) => {
      if (!prev.includes(entityId)) {
        throw new Error(`Card "${entityId}" is not in player hand.`);
      }
      return prev.filter((id) => id !== entityId);
    });
    updateEntityVisual(entityId, {
      x,
      y,
      height: 0,
      revealed: true,
    });
    addLog("INFO", `Card "${entityId}" played from hand to table.`, { entityId, x, y });
  };

  const resetDemo = () => {
    setEntities(createInitialEntityMap());
    setPlayerHand(INITIAL_PLAYER_HAND);
    setOpponentHand(INITIAL_OPPONENT_HAND);
    setSelectedEntityId("hero-card");
    addLog("WARN", "Demo reset to initial entity state.");
  };

  const value = useMemo(
    () => ({
      cameraMode,
      cameraPreset: CAMERA_PRESETS[cameraMode],
      setCameraMode,
      cameraPresets: CAMERA_PRESETS,
      entities,
      playerHand,
      opponentHand,
      selectedEntityId,
      setSelectedEntityId,
      executeAction,
      playCardFromHand,
      logs,
      clearLogs,
      resetDemo,
    }),
    [cameraMode, entities, logs, opponentHand, playerHand, selectedEntityId]
  );

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within BoardProvider");
  }
  return context;
}

export function useBoardCamera() {
  const { cameraMode, cameraPreset, cameraPresets, setCameraMode } = useBoard();
  return { cameraMode, cameraPreset, cameraPresets, setCameraMode };
}
