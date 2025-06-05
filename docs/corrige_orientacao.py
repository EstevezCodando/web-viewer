import trimesh
import numpy as np
from trimesh.scene import Scene
from trimesh.transformations import rotation_matrix

# Caminho do modelo original
caminho_entrada = "carta_brasilia.glb"
caminho_saida = "carta_brasilia_corrigido_rotacionado.glb"

# Carrega a cena (pode conter múltiplas malhas)
scene = trimesh.load(caminho_entrada)

if isinstance(scene, Scene):
    # Bounding box da cena
    bounds = scene.bounds
    tamanho_max = np.max(bounds[1] - bounds[0])
    fator_escala = 1.0 / tamanho_max if tamanho_max > 0 else 1.0

    nova_cena = Scene()

    for nome, geometria in scene.geometry.items():
        geometria_corrigida = geometria.copy()

        # Centralizar no 0,0,0
        geometria_corrigida.apply_translation(-geometria.centroid)

        # Escalar para caber em 1 metro
        geometria_corrigida.apply_scale(fator_escala)

        # Rotacionar -90° no eixo X para deitar a carta
        angulo_rad = np.radians(-90)
        rotacao = rotation_matrix(angle=angulo_rad, direction=[1, 0, 0])
        geometria_corrigida.apply_transform(rotacao)

        nova_cena.add_geometry(geometria_corrigida)

    # Exportar modelo corrigido
    nova_cena.export(caminho_saida)
    print(f"✅ Modelo corrigido salvo como: {caminho_saida}")
else:
    print("❌ O modelo carregado não é uma cena válida.")
