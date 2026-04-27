export const CAMERA_PRESETS = {
  GLOBAL: { key: "GLOBAL", pitch: 20, zoom: 0.8, label: "Global" },
  TACTICAL: { key: "TACTICAL", pitch: 45, zoom: 1.2, label: "Tactical" },
  FOCUS: { key: "FOCUS", pitch: 60, zoom: 2.0, label: "Focus" },
};

export const ACTION_TYPES = {
  MOVE_ENTITY: "MOVE_ENTITY",
  SET_VISUAL: "SET_VISUAL",
  SET_PROPERTY: "SET_PROPERTY",
  PATCH_PROPERTIES: "PATCH_PROPERTIES",
  SET_STATES: "SET_STATES",
  ADD_STATE: "ADD_STATE",
  REMOVE_STATE: "REMOVE_STATE",
  REVEAL_ENTITY: "REVEAL_ENTITY",
};

/**
 * @typedef {Object} EntityVisual
 * @property {number} gridX
 * @property {number} gridY
 * @property {number} height
 * @property {number} rotation
 * @property {boolean} revealed
 */

/**
 * @typedef {Object} EntityMetadata
 * @property {string} name
 * @property {string} type
 * @property {string} ownerId
 */

/**
 * @typedef {Object} BoardEntity
 * @property {string} id
 * @property {EntityVisual} visual
 * @property {EntityMetadata} metadata
 * @property {Record<string, number|string>} properties
 * @property {string[]} states
 */
