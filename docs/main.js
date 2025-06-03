/* eslint-disable no-console */
import { MindARThree } from 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js';
import * as THREE        from 'https://cdn.jsdelivr.net/npm/three@0.174.0/build/three.module.js';
import { GLTFLoader }    from 'https://cdn.jsdelivr.net/npm/three@0.174.0/examples/jsm/loaders/GLTFLoader.js';

async function iniciarAR() {
  // --- Inicialização do MindAR ---
  const mindar = new MindARThree({
    container : document.body,
    imageTargetSrc : './assets/qrcode.mind',
    filterMinCF : 0.0001,  // menos “tremor” (opcional)
    filterBeta  : 0.001
  });

  const { renderer, scene, camera } = mindar;

  // --- Iluminação básica ---
  const luzAmbiente = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  scene.add(luzAmbiente);

  // --- Carregar o modelo topográfico ---
  const loader = new GLTFLoader();
  const modelo = await loader.loadAsync('./assets/carta_topografica.glb');

  // Ajustes opcionais de escala/posição, se necessário
  modelo.scene.scale.set(0.01, 0.01, 0.01); // 1 cm = 1 m virtual
  modelo.scene.rotation.x = -Math.PI / 2;   // deita o mapa para plano XY

  // --- Âncora vinculada ao QR ---
  const anchor = mindar.addAnchor(0); // “0” → primeiro alvo dentro do .mind
  anchor.group.add(modelo.scene);

  // --- Loop de renderização ---
  const animar = () => {
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  };

  // --- Começar ---
  await mindar.start();      // solicita acesso à câmera
  document.getElementById('carregando').remove();
  animar();
}

iniciarAR().catch(console.error);
