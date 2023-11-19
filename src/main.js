import World from "./scene/world";

/**
 * The main world instance for the 3D scene.
 * @type {World}
 */
const world = new World();

/**
 * Initialize the 3D world.
 * @async
 */
await world.init();

/**
 * Start the animation loop for the 3D world.
 */
world.animate();

/**
 * The main world instance exported for use in other modules.
 * @type {World}
 */
export default world;
