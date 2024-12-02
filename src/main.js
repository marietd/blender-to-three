import * as THREE from '../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

let cubeMixer, sphereMixer; // Separate mixers for the cube and sphere
const clock = new THREE.Clock(); // For delta time calculation

let cubeTexture;
let coneMaterial;

// Load the GLB model
const loader = new GLTFLoader();
loader.load(
    import.meta.env.DEV 
    ? './public/blenderthreeanimated2.glb' 
    : `${import.meta.env.BASE_URL}blenderthreeanimated2.glb`,
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);

    // Find the cube and sphere objects by name
    const cube = model.getObjectByName('Cube');
    const sphere = model.getObjectByName('Sphere');

    // Check if the animations exist and set up the mixers
    if (cube && gltf.animations.length > 0) {
      cubeMixer = new THREE.AnimationMixer(cube);
      const cubeClip = gltf.animations.find((clip) => clip.name === 'CubeAction'); // Replace with the correct name
      if (cubeClip) {
        const cubeAction = cubeMixer.clipAction(cubeClip);
        cubeAction.play();
      }
    }

    if (sphere && gltf.animations.length > 0) {
      sphereMixer = new THREE.AnimationMixer(sphere);
      const sphereClip = gltf.animations.find((clip) => clip.name === 'SphereAction'); // Replace with the correct name
      if (sphereClip) {
        const sphereAction = sphereMixer.clipAction(sphereClip);
        sphereAction.play();
      }
    }

    model.traverse(function(node) {
      if (node.isMesh && node.name === 'Cube') {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(
            import.meta.env.DEV 
            ? './public/pattern.jpg' 
            : `${import.meta.env.BASE_URL}pattern.jpg`,
            function(texture) {
              node.material.map = texture;
              node.material.needsUpdate = true;
              cubeTexture = texture;
          });
      }

      if (node.isMesh && node.name === 'Sphere') {
        // Apply a custom shader material to the sphere
        const vertexShader = `
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `;
        
        const fragmentShader = `
          uniform vec3 color;
          varying vec3 vPosition;
          
          void main() {
            gl_FragColor = vec4(color * 0.5 + 0.5, 1.0);  // Basic color manipulation
          }
        `;

        const sphereMaterial = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: {
            color: { value: new THREE.Color(0x44aa88) },
          },
        });
        node.material = sphereMaterial;
        window.sphereMaterial = sphereMaterial;
      }
  });

    // Add lighting to the scene
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    camera.position.set(3, 1, 5); // Adjust x, y, z as needed
    camera.lookAt(scene.position);

  },
  (progress) => {
    console.log(`Loading file: ${(progress.loaded / progress.total * 100)}% loaded`);
  },
  (error) => {
    console.error('An error occurred while loading the GLB model:', error);
  }
);

loader.load(
    import.meta.env.DEV 
    ? './public/cone.glb'
    : `${import.meta.env.BASE_URL}cone.glb`,
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);
  
      const cone = model.getObjectByName('Cone');
      if (cone && cone.isMesh) {
        cone.position.x = 2;
        coneMaterial = cone.material;
      }
    },
    (progress) => {
      console.log(`Loading second model: ${(progress.loaded / progress.total * 100)}% loaded`);
    },
    (error) => {
      console.error('An error occurred while loading the second GLB model:', error);
    }
  );

// Get the sliders and add event listeners to control animation speed
const cubeSpeedSlider = document.getElementById('cube-animation-speed');
const sphereSpeedSlider = document.getElementById('sphere-animation-speed');
const cubeTextureSlider = document.getElementById('cube-texture');
const sphereShaderSlider = document.getElementById('sphere-shader');
const coneColourSlider = document.getElementById('cone-colour');

cubeSpeedSlider.addEventListener('input', (event) => {
  const speed = parseFloat(event.target.value);
  if (cubeMixer) {
    cubeMixer.timeScale = speed;
  }
});

sphereSpeedSlider.addEventListener('input', (event) => {
  const speed = parseFloat(event.target.value);
  if (sphereMixer) {
    sphereMixer.timeScale = speed;
  }
});

cubeTextureSlider.addEventListener('input', (event) => {
  const texture = parseFloat(event.target.value);
  if (cubeMixer) {
    cubeTexture.repeat.set(texture, texture);
    cubeTexture.needsUpdate = true;
  }
});

sphereShaderSlider.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    if (window.sphereMaterial) {
        const color = new THREE.Color(value, 0.5, 1 - value);
        window.sphereMaterial.uniforms.color.value = color;
        sphereMaterial.needsUpdate = true;
      }
    }
);

coneColourSlider.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    if (coneMaterial && coneMaterial.color) {
        const colour = new THREE.Color(value, 0.5, 1 - value);
        coneMaterial.color.copy(colour);
        coneMaterial.needsUpdate = true;
      }
    }
);

function animate() {
  // Calculate delta time for consistent animations
  const deltaTime = clock.getDelta();

  // Update the mixers
  if (cubeMixer) {
    cubeMixer.update(deltaTime);
  }
  if (sphereMixer) {
    sphereMixer.update(deltaTime);
  }

  renderer.render(scene, camera);
}