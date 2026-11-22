"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const WORLD_URL =
  "/models/bought-a-bigger-house-just-so-that-i-could-keep-you-somewhere-safe.glb";
const STEVE_URL = "/models/minecraft_-_steve.glb";
const CHEST_URL = "/models/minecraft_chest.glb";

const WORLD_SCALE = 10;
const STEVE_SCALE = 0.05;
const CHEST_SCALE = 0.006;

const SPAWN = { x: 4, y: 3.125, z: 8 };
const CHEST = { x: 6, y: 3.125, z: 7 };

const WALKABLE_MATERIALS = new Set([
  "Grass_Block",
  "Stone",
  "Cobblestone",
  "Gravel",
  "Dirt",
  "Sand",
  "Sandstone",
  "Oak_Planks",
  "Oak_Slab",
  "Double_Oak_Slab",
  "Stone_Slab",
  "Double_Stone_Slab",
  "Oak_Stairs",
  "Birch_Stairs",
  "Cobblestone_Stairs",
  "Stone_Brick_Stairs",
  "Spruce_Stairs",
  "Jungle_Stairs",
  "Farmland",
]);

function PlayableWorld({
  onNearChest,
  paused,
}: {
  onNearChest: (near: boolean) => void;
  paused: boolean;
}) {
  const world = useGLTF(WORLD_URL);
  const steve = useGLTF(STEVE_URL);
  const chest = useGLTF(CHEST_URL);

  const terrainRef = useRef<THREE.Group>(null);
  const playerRef = useRef<THREE.Group>(null);
  const keys = useRef(new Set<string>());
  const player = useRef(new THREE.Vector3(SPAWN.x, SPAWN.y, SPAWN.z));
  const nearRef = useRef(false);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const down = useMemo(() => new THREE.Vector3(0, -1, 0), []);
  const origin = useMemo(() => new THREE.Vector3(), []);
  const cameraGoal = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);

  const steveOffset = useMemo(
    () =>
      -new THREE.Box3().setFromObject(steve.scene).min.y *
      STEVE_SCALE,
    [steve.scene]
  );

  const chestOffset = useMemo(
    () =>
      -new THREE.Box3().setFromObject(chest.scene).min.y *
      CHEST_SCALE,
    [chest.scene]
  );

  useEffect(() => {
    const movementKeys = new Set([
      "KeyW", "KeyA", "KeyS", "KeyD",
      "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight",
    ]);

    const keyDown = (event: KeyboardEvent) => {
      if (!movementKeys.has(event.code)) return;
      event.preventDefault();
      keys.current.add(event.code);
    };

    const keyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code);
    };

    const reset = () => keys.current.clear();

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", reset);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", reset);
    };
  }, []);

  useFrame(({ camera }, elapsed) => {
    const delta = Math.min(elapsed, 0.05);
    const p = player.current;

    const left = keys.current.has("KeyA") ||
      keys.current.has("ArrowLeft");
    const right = keys.current.has("KeyD") ||
      keys.current.has("ArrowRight");
    const forward = keys.current.has("KeyW") ||
      keys.current.has("ArrowUp");
    const backward = keys.current.has("KeyS") ||
      keys.current.has("ArrowDown");

    let dx = Number(right) - Number(left);
    let dz = Number(backward) - Number(forward);

    if (!paused && (dx !== 0 || dz !== 0)) {
      const length = Math.hypot(dx, dz);
      dx /= length;
      dz /= length;

      const speed = 2.8;
      const nextX = THREE.MathUtils.clamp(
        p.x + dx * speed * delta, -8.8, 8.8
      );
      const nextZ = THREE.MathUtils.clamp(
        p.z + dz * speed * delta, -9.8, 9.8
      );

      if (terrainRef.current) {
        origin.set(nextX, p.y + 1.0, nextZ);
        raycaster.set(origin, down);

        const hits = raycaster.intersectObject(
          terrainRef.current, true
        );

        // Prototype walkable-surface detection:
        // avoid jumping onto roofs and steep objects.
        const ground = hits.find((hit) => {
          const mesh = hit.object as THREE.Mesh;
          const material = mesh.material;

          const walkable = Array.isArray(material)
            ? material.some((part) =>
                WALKABLE_MATERIALS.has(part.name)
              )
            : Boolean(
                material && WALKABLE_MATERIALS.has(material.name)
              );

          return (
            walkable &&
            (hit.face?.normal.y ?? -1) >= 0.65 &&
            Math.abs(hit.point.y - p.y) <= 0.75
          );
        });

        if (ground) {
          // Check for nearby solid geometry at waist height.
          origin.set(p.x, p.y + 0.8, p.z);
          raycaster.set(
            origin,
            new THREE.Vector3(dx, 0, dz)
          );

          const blocked = raycaster.intersectObject(
            terrainRef.current, true
          ).some(
            (hit) => hit.distance > 0.02 &&
              hit.distance < 0.42
          );

          if (!blocked) {
            p.set(nextX, ground.point.y, nextZ);
          }
        }
      }

      if (playerRef.current) {
        playerRef.current.rotation.y = Math.atan2(-dx, -dz);
      }
    }

    if (playerRef.current) {
      playerRef.current.position.copy(p);
    }

    cameraGoal.set(p.x + 3.5, p.y + 4.2, p.z + 6);
    camera.position.lerp(
      cameraGoal,
      1 - Math.exp(-5 * delta)
    );

    target.set(p.x, p.y + 1.1, p.z);
    camera.lookAt(target);

    const near =
      Math.hypot(p.x - CHEST.x, p.z - CHEST.z) < 1.7;

    if (near !== nearRef.current) {
      nearRef.current = near;
      onNearChest(near);
    }
  });

  return (
    <>
      <ambientLight intensity={1.6} />
      <directionalLight
        position={[8, 14, 10]}
        intensity={2.1}
      />

      <group ref={terrainRef}>
        <primitive
          object={world.scene}
          scale={WORLD_SCALE}
        />
      </group>

      <group
        ref={playerRef}
        position={[SPAWN.x, SPAWN.y, SPAWN.z]}
      >
        <primitive
          object={steve.scene}
          scale={STEVE_SCALE}
          position={[0, steveOffset, 0]}
        />
      </group>

      <primitive
        object={chest.scene}
        scale={CHEST_SCALE}
        position={[CHEST.x, CHEST.y + chestOffset, CHEST.z]}
      />
    </>
  );
}

export default function HouseScene() {
  const [nearChest, setNearChest] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);

  useEffect(() => {
    const interact = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        setChestOpen(false);
      }

      if (
        event.code === "KeyE" &&
        nearChest &&
        !event.repeat
      ) {
        event.preventDefault();
        setChestOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", interact);
    return () =>
      window.removeEventListener("keydown", interact);
  }, [nearChest]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{
          position: [8, 5, 14],
          fov: 55,
          near: 0.05,
          far: 150,
        }}
        dpr={[1, 1.5]}
        frameloop="always"
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <PlayableWorld
            onNearChest={setNearChest}
            paused={chestOpen}
          />
        </Suspense>
      </Canvas>

      {nearChest && !chestOpen && (
        <button
          type="button"
          onClick={() => setChestOpen(true)}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 border border-neutral-400 bg-black/85 px-4 py-3 font-mono text-xs text-white"
        >
          Press E / Open Research Chest
        </button>
      )}

      {chestOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Research chest"
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/85 p-5"
        >
          <div className="w-full max-w-lg border border-neutral-500 bg-neutral-950 p-6 text-neutral-100">
            <h2 className="text-2xl font-bold text-white">
              Research Chest
            </h2>

            <p className="mt-4 text-sm text-neutral-300">
              The chest interaction is working. In Task 17.4,
              this panel will display the complete project
              inventory using the archive&apos;s actual records.
            </p>

            <Link
              href="/"
              className="mt-5 block text-sm underline"
            >
              View the existing research archive
            </Link>

            <button
              type="button"
              onClick={() => setChestOpen(false)}
              className="mt-6 min-h-11 border border-neutral-500 px-4 font-mono text-xs"
            >
              Close Chest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
