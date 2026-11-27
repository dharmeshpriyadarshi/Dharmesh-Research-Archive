"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  Bounds,
  Center,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";

const WORLD_URL = "/models/soulwitchs-world.glb";

export type SurfaceSample = {
  world: [number, number, number];
  source: [number, number, number];
  mesh: string;
};

// Confirmed material names from the exported GLB.
// Keep glass, doors, and other materials unchanged.
const CUTOUT_MATERIAL_NAMES = new Set([
  "acacia_leaves",
  "bamboo_large_leaves",
  "bamboo_small_leaves",
  "bamboo_stalk",
  "cherry_leaves",
  "cherry_sapling",
  "cornflower",
  "crimson_fungus",
  "dandelion",
  "lilac_bottom",
  "lilac_top",
  "oak_leaves",
  "pink_tulip",
  "short_grass",
  "tall_grass_bottom",
  "tall_grass_top",
  "vine",
]);

function WorldModel({
  onReady,
  orientation,
  onSurfaceSample,
}: {
  onReady: () => void;
  orientation: "source" | "upright";
  onSurfaceSample: (sample: SurfaceSample) => void;
}) {
  const { scene } = useGLTF(WORLD_URL);

  // An independent instance prevents the cached GLB
  // from accumulating transforms between preview visits.
  const instance = useMemo(() => {
    // Clone the scene to avoid modifying the cached GLB.
    const copy = scene.clone(true);

    copy.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      const fixMaterial = (
        material: THREE.Material
      ): THREE.Material => {
        if (
          !CUTOUT_MATERIAL_NAMES.has(material.name) ||
          !(material instanceof THREE.MeshStandardMaterial)
        ) {
          return material;
        }

        // Preserve the original material and texture,
        // but use alpha cutout instead of alpha blending.
        const fixed = material.clone();

        fixed.alphaTest = 0.5;
        fixed.transparent = false;
        fixed.depthWrite = true;
        fixed.needsUpdate = true;

        return fixed;
      };

      object.material = Array.isArray(object.material)
        ? object.material.map(fixMaterial)
        : fixMaterial(object.material);
    });

    return copy;
  }, [scene]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <Center>
      <group
        rotation={
          orientation === "upright"
            ? [Math.PI / 2, 0, 0]
            : [0, 0, 0]
        }
      >
        <primitive
          object={instance}
          onClick={(event: ThreeEvent<MouseEvent>) => {
            if (
              orientation !== "source" ||
              !event.nativeEvent.shiftKey
            ) {
              return;
            }

            event.stopPropagation();

            const source = instance.worldToLocal(
              event.point.clone()
            );

            onSurfaceSample({
              world: [
                event.point.x,
                event.point.y,
                event.point.z,
              ],
              source: [source.x, source.y, source.z],
              mesh: event.object.name || "Unnamed mesh",
            });
          }}
        />
      </group>
    </Center>
  );
}

export default function WorldCanvas({
  onReady,
  orientation,
  onSurfaceSample,
  selected,
}: {
  onReady: () => void;
  orientation: "source" | "upright";
  onSurfaceSample: (sample: SurfaceSample) => void;
  selected: SurfaceSample | null;
}) {
  return (
    <Canvas
      camera={{
        position: [20, 18, 20],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
      style={{ background: "#171717" }}
    >
      <ambientLight intensity={1.5} />

      <directionalLight
        position={[15, 30, 20]}
        intensity={2}
      />

      <OrbitControls
        makeDefault
        enableDamping
        enablePan
        enableZoom
        minDistance={2}
        maxDistance={500}
      />

      <Suspense fallback={null}>
        <Bounds
          key={orientation}
          fit
          clip
          observe
          margin={1.25}
        >
          <WorldModel
            onReady={onReady}
            orientation={orientation}
            onSurfaceSample={onSurfaceSample}
          />
        </Bounds>
      </Suspense>

      {orientation === "source" && selected && (
        <mesh
          position={[
            selected.world[0],
            selected.world[1] + 0.4,
            selected.world[2],
          ]}
        >
          <sphereGeometry args={[0.4, 16, 12]} />
          <meshBasicMaterial
            color="#facc15"
            depthTest={false}
          />
        </mesh>
      )}
    </Canvas>
  );
}
