"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
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

    const head = copy.getObjectByName("Head");
    const leftArm = copy.getObjectByName("LeftArm");
    const rightArm = copy.getObjectByName("RightArm");

    if (!head || !leftArm || !rightArm) {
      throw new Error(
        "Custom Steve animation nodes are missing."
      );
    }

    const idle = {
      head,
      leftArm,
      rightArm,
      headBaseY: head.rotation.y,
      headBaseZ: head.rotation.z,
      leftArmBaseX: leftArm.rotation.x,
      rightArmBaseX: rightArm.rotation.x,
    };

    return { copy, scale, offset, idle };
  }, [scene]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const idle = avatar.idle;

    // Preserve original rotations and animate relative to them.
    idle.head.rotation.y =
      idle.headBaseY + Math.sin(t * 0.85) * 0.18;

    idle.head.rotation.z =
      idle.headBaseZ + Math.sin(t * 0.70) * 0.04;

    const armSwing = Math.sin(t * 1.15) * 0.15;

    idle.leftArm.rotation.x =
      idle.leftArmBaseX + armSwing;

    idle.rightArm.rotation.x =
      idle.rightArmBaseX - armSwing;
  });

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
