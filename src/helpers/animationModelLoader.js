import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { setupModel } from '../components/setupBirds.js';

async function loadBirds() {
    const loader = new GLTFLoader();

    const [storkData] = await Promise.all([
        loader.loadAsync('/assets/birds/Stork.glb'),
    ]);

    console.log('Squaaawk!', storkData);

    const stork = setupModel(storkData);
    stork.position.set(50, 50, 50);

    return {
        stork,
    };
}

export { loadBirds };