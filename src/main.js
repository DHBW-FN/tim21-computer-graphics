import World from "./scene/world";

const world = new World();

await world.init();

world.animate();

export default world;
