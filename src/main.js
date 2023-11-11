import World from "./scene/world";

const world = new World();
world.animate();

await world.init();

world.start();

export default world;
