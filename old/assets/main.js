/* eslint-disable no-console */
import { MindARThree } from 'mind-ar-image-three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Elementos do DOM para feedback
const feedbackContainer = document.getElementById('feedback-container');
const feedbackMessage = document.getElementById('feedback-message');
const startButton = document.getElementById('startButton');
const initialPromptElements = document.getElementById('initial-prompt-elements');

function updateFeedback(message, isError = false) {
  if (feedbackMessage) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = isError ? 'error' : '';
  }
  if (isError) {
    console.error(`[AR Feedback] ${message}`);
  } else {
    console.log(`[AR Feedback] ${message}`);
  }
}

async function iniciarAR() {
  try {
    // Hide initial prompt and button
    if (initialPromptElements) initialPromptElements.classList.add('hidden');
    feedbackMessage.textContent = '🔄 Carregando e iniciando a câmera...'; // Initial message when AR starts

    updateFeedback('1/5 - Inicializando MindAR...');
    const mindarThree = new MindARThree({
      container: document.body,
      imageTargetSrc: './assets/qrcode.mind',
      maxTrack: 1,
      filterMinCF: 0.001,
      filterBeta: 0.01,
      // uiLoading: "yes", // You can enable MindAR's built-in UI if preferred
      // uiScanning: "yes",
      // uiError: "yes"
    });

    const { renderer, scene, camera } = mindarThree;
    updateFeedback('2/5 - Configurando cena 3D...');

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- CÓDIGO DE TESTE COM UM CUBO ---
    updateFeedback('3/5 - Criando objeto de teste (cubo)...');
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    // cube.position.set(0, 0.1, 0); // Posição relativa à âncora (um pouco para cima) -> Adjust after anchoring
    const modeloScene = cube;
    updateFeedback('Objeto de teste criado.');
    // --- FIM DO CÓDIGO DE TESTE ---

    /*
    // --- Carregar o modelo topográfico ---
    updateFeedback('3/5 - Carregando modelo 3D (carta_topografica.glb)...');
    const loader = new GLTFLoader();
    let modeloScene;
    try {
      const gltf = await loader.loadAsync('./assets/carta_topografica.glb');
      modeloScene = gltf.scene;
      updateFeedback('Modelo 3D carregado.');
    } catch (err) {
      // throw new Error(`Falha ao carregar o modelo GLB: ${err.message}`); // This would be caught by the outer try-catch
      updateFeedback(`ERRO AO CARREGAR MODELO: ${err.message}. Usando cubo de fallback.`, true);
      // Fallback to cube if model loading fails
      const fallbackGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const fallbackMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red for error
      modeloScene = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
    }
    */
    
    // Ajustes no modelo (escala, posição, rotação)
    modeloScene.scale.set(0.1, 0.1, 0.1);
    modeloScene.position.set(0, 0, 0); // Posição relativa à âncora (será [0,0,0] do target)
                                      // Se quiser que o cubo fique um pouco acima do target, ajuste aqui, ex: modeloScene.position.set(0, 0.1, 0);
    modeloScene.rotation.x = -Math.PI / 2; // Deita o mapa

    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(modeloScene); // Adiciona o modelo (cubo ou GLTF) ao grupo da âncora

    anchor.onTargetFound = () => {
      updateFeedback('Alvo (QR Code) encontrado!', false);
      console.log("Alvo encontrado");
    }
    anchor.onTargetLost = () => {
      updateFeedback('Alvo (QR Code) perdido.', false);
      console.log("Alvo perdido");
    }
    
    updateFeedback('4/5 - Iniciando motor AR e câmera...');
    // --- Iniciar MindAR ---
    // Isso solicitará permissão para a câmera.
    await mindarThree.start();
    updateFeedback('5/5 - Sistema AR pronto! Procure o QR Code.', false);
    
    if (feedbackContainer) feedbackContainer.classList.add('hidden');

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

  } catch (error) {
    updateFeedback(`ERRO CRÍTICO: ${error.message}`, true);
    console.error("Falha ao iniciar AR:", error);
    if (feedbackContainer) {
        // Ensure the initial prompt is hidden if an error occurs after trying to start
        if (initialPromptElements && !initialPromptElements.classList.contains('hidden')) {
            initialPromptElements.classList.add('hidden');
        }
        feedbackContainer.classList.remove('hidden'); // Make sure feedback is visible
        const p = document.createElement('p');
        p.textContent = "Verifique o console (F12) para mais detalhes e se todos os arquivos (modelo, .mind) estão nos locais corretos.";
        p.style.fontSize = "0.8em";
        p.style.marginTop = "10px";
        feedbackContainer.appendChild(p);
    }
  }
}

// Adiciona o listener ao botão para iniciar a aplicação AR
if (startButton) {
  startButton.addEventListener('click', () => {
    // Opcionalmente, desabilitar o botão para evitar múltiplos cliques
    startButton.disabled = true;
    startButton.textContent = "Iniciando...";
    iniciarAR();
  });
} else {
  updateFeedback('ERRO: Botão de início não encontrado.', true);
}