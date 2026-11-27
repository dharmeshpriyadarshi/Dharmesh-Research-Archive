"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

const STEVE_URL = "/models/custom_steve.glb";
const PLAYER_HEIGHT = 1.8;

export default function StevePlacement() {
  const { scene } = useGLTF(STEVE_URL);

  const avatar = useMemo(() => {
    // Reuse the established skeleton-safe cloning approach.
    const copy = cloneSkeleton(scene);
    copy.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(copy);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    if (
      bounds.isEmpty() ||
      !Number.isFinite(size.y) ||
      size.y <= 0
    ) {
      throw new Error("Steve model has invalid geometry bounds.");
    }

    // The old HouseScene uses a different world scale.
    // Normalize this model to approximately 1.8 scene units.
    const scale = PLAYER_HEIGHT / size.y;

    const offset: [number, number, number] = [
      -center.x * scale,
      -bounds.min.y * scale,
      -center.z * scale,
    ];

    return { copy, scale, offset };
  }, [scene]);

  return (
    <group>
      <primitive
        object={avatar.copy}
        scale={avatar.scale}
        position={avatar.offset}
      />
    </group>
  );
}

useGLTF.preload(STEVE_URL);
