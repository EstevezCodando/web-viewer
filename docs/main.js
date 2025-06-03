/* eslint-disable no-console */
import { MindARThree } from 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js';
// Atenção: A versão 0.174.0 do Three.js não existe no CDN. Usando 0.165.0 que é uma versão estável recente.
// Se precisar de uma versão específica, verifique a disponibilidade em https://www.jsdelivr.com/package/npm/three
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/GLTFLoader.js';

// Elementos do DOM para feedback
const feedbackContainer = document.getElementById('feedback-container');
const feedbackMessage = document.getElementById('feedback-message');

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
    updateFeedback('1/5 - Inicializando MindAR...');
    // --- Inicialização do MindAR ---
    // O container é o body, mas o MindAR criará seu próprio canvas
    const mindarThree = new MindARThree({
      container: document.body,
      // IMPORTANTE: 'imageTargetSrc' aponta para um arquivo .mind compilado.
      // Você DEVE gerar este arquivo a partir da sua imagem de QR Code (ou outra imagem alvo)
      // usando o compilador online do MindAR: https://hiukim.github.io/mind-ar-js-doc/tools/compile
      // Coloque o arquivo 'qrcode.mind' (ou o nome que você der) na pasta 'assets'.
      imageTargetSrc: './assets/targets.mind', // Ex: se o seu QR Code se chama 'qrcode.png', compile-o para 'qrcode.mind'
      maxTrack: 1, // Rastrear apenas 1 alvo por vez
      filterMinCF: 0.001, // Parâmetros para suavizar o rastreamento (ajuste conforme necessário)
      filterBeta: 0.01,
      // uiLoading: "yes", // Pode usar o UI de loading padrão do MindAR se preferir
      // uiScanning: "yes",
      // uiError: "yes"
    });

    const { renderer, scene, camera } = mindarThree;
    updateFeedback('2/5 - Configurando cena 3D...');

    // --- Iluminação ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Luz ambiente suave
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Luz direcional para sombras e destaques
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // --- Carregar o modelo topográfico ---
    // IMPORTANTE: Certifique-se que o modelo 'carta_topografica.glb' está na pasta 'assets'.
    updateFeedback('3/5 - Carregando modelo 3D (carta_topografica.glb)...');
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('./assets/carta_topografica.glb').catch(err => {
        throw new Error(`Falha ao carregar o modelo GLB: ${err.message}`);
    });
    
    const modeloScene = gltf.scene;
    updateFeedback('Modelo 3D carregado.');

    // Ajustes no modelo (escala, posição, rotação)
    // Estes valores dependem de como seu modelo foi exportado.
    // A escala 0.01 pode ser muito pequena. Teste e ajuste.
    modeloScene.scale.set(0.1, 0.1, 0.1); // Aumentei um pouco a escala para teste inicial
    modeloScene.position.set(0, 0, 0); // Posição relativa à âncora
    modeloScene.rotation.x = -Math.PI / 2; // Deita o mapa (comum para modelos do Blender)

    // --- Âncora ---
    // O '0' refere-se ao primeiro alvo (target) definido no seu arquivo .mind.
    // Se o seu arquivo .mind tiver múltiplos alvos, você usaria o índice correspondente.
    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(modeloScene); // Adiciona a cena do modelo ao grupo da âncora

    // Opcional: Adicionar um listener para quando o alvo é encontrado/perdido
    anchor.onTargetFound = () => {
      updateFeedback('Alvo (QR Code) encontrado!', false);
      console.log("Alvo encontrado");
      // Você pode adicionar animações ou outras lógicas aqui
    }
    anchor.onTargetLost = () => {
      updateFeedback('Alvo (QR Code) perdido.', false);
      console.log("Alvo perdido");
      // Você pode pausar animações ou esconder elementos aqui
    }
    
    updateFeedback('4/5 - Iniciando motor AR e câmera...');
    // --- Iniciar MindAR ---
    // Isso solicitará permissão para a câmera.
    await mindarThree.start();
    updateFeedback('5/5 - Sistema AR pronto! Procure o QR Code.', false);
    
    // Esconde o container de feedback após o início bem-sucedido
    if (feedbackContainer) feedbackContainer.classList.add('hidden');

    // --- Loop de Renderização ---
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

  } catch (error) {
    updateFeedback(`ERRO CRÍTICO: ${error.message}`, true);
    console.error("Falha ao iniciar AR:", error);
    // Não esconda o feedback container se houver um erro crítico
    if (feedbackContainer) {
        const p = document.createElement('p');
        p.textContent = "Verifique o console (F12) para mais detalhes e se todos os arquivos (modelo, .mind) estão nos locais corretos.";
        p.style.fontSize = "0.8em";
        feedbackContainer.appendChild(p);
    }
  }
}

// Inicia a aplicação AR
iniciarAR();
