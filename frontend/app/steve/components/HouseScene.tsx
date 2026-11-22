"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

const WORLD_URL =
  "/models/bought-a-bigger-house-just-so-that-i-could-keep-you-somewhere-safe.glb";
const STEVE_URL = "/models/minecraft_-_steve.glb";
const CHEST_URL = "/models/minecraft_chest.glb";

const WORLD_SCALE = 10;
const STEVE_SCALE = 0.0390625;
const CHEST_SCALE = 0.00324;

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

type CameraOrbit = {
  yaw: number;
  pitch: number;
  distance: number;
  following: boolean;
};

function PlayableWorld({
  onNearChest,
  paused,
  orbit,
  showChestMarker,
}: {
  onNearChest: (near: boolean) => void;
  paused: boolean;
  orbit: { current: CameraOrbit };
  showChestMarker: boolean;
}) {
  const world = useGLTF(WORLD_URL);
  const steve = useGLTF(STEVE_URL);
  const chest = useGLTF(CHEST_URL);

  // Clone cached GLB scenes for every world entry.
  // Preserve their original root rotations and transforms.
  const worldScene = useMemo(
    () => world.scene.clone(true),
    [world.scene]
  );

  const steveScene = useMemo(
    () => cloneSkeleton(steve.scene),
    [steve.scene]
  );

  const chestScene = useMemo(
    () => cloneSkeleton(chest.scene),
    [chest.scene]
  );

  const terrainRef = useRef<THREE.Group>(null);
  const playerRef = useRef<THREE.Group>(null);
  const keys = useRef(new Set<string>());
  const player = useRef(new THREE.Vector3(SPAWN.x, SPAWN.y, SPAWN.z));
  const nearRef = useRef(false);
  const movementBasis = useRef<number | null>(null);
  const grounded = useRef(true);
  const verticalVelocity = useRef(0);
  const jumpRequested = useRef(false);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const down = useMemo(() => new THREE.Vector3(0, -1, 0), []);
  const origin = useMemo(() => new THREE.Vector3(), []);
  const cameraGoal = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const cameraDirection = useMemo(
    () => new THREE.Vector3(),
    []
  );

  const steveOffset = useMemo(
    () =>
      -new THREE.Box3().setFromObject(steveScene).min.y *
      STEVE_SCALE,
    [steveScene]
  );

  const chestOffset = useMemo(
    () =>
      -new THREE.Box3().setFromObject(chestScene).min.y *
      CHEST_SCALE,
    [chestScene]
  );

  useEffect(() => {
    const movementKeys = new Set([
      "KeyW", "KeyA", "KeyS", "KeyD",
      "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight",
    ]);

    const keyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        if (!event.repeat) jumpRequested.current = true;
        return;
      }

      if (!movementKeys.has(event.code)) return;
      event.preventDefault();
      keys.current.add(event.code);
    };

    const keyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code);
    };

    const reset = () => {
      keys.current.clear();
      jumpRequested.current = false;
    };

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

    // The GLB contains Z-up geometry rotated into Y-up space.
    // Raycast face normals must therefore be transformed to world space.
    const findGround = (
      x: number,
      z: number,
      feetY: number
    ): number | null => {
      if (!terrainRef.current) return null;

      origin.set(x, feetY + 1.5, z);
      raycaster.set(origin, down);
      raycaster.far = 6;

      const hits = raycaster.intersectObject(
        terrainRef.current,
        true
      );

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

        if (!walkable || !hit.face) return false;

        const normal = hit.face.normal
          .clone()
          .transformDirection(hit.object.matrixWorld);

        return (
          normal.y >= 0.65 &&
          hit.point.y <= feetY + 0.43
        );
      });

      return ground?.point.y ?? null;
    };

    const left =
      keys.current.has("KeyA") ||
      keys.current.has("ArrowLeft");
    const right =
      keys.current.has("KeyD") ||
      keys.current.has("ArrowRight");
    const forward =
      keys.current.has("KeyW") ||
      keys.current.has("ArrowUp");
    const backward =
      keys.current.has("KeyS") ||
      keys.current.has("ArrowDown");

    // Movement is relative to the camera, not world axes.
    const sideways = Number(right) - Number(left);
    const forwardInput = Number(forward) - Number(backward);
    const hasInput =
      sideways !== 0 || forwardInput !== 0;

    if (!hasInput || paused || !orbit.current.following) {
      movementBasis.current = null;
    }

    // Prevent camera-follow rotation from continuously
    // changing movement direction during a held keypress.
    const yaw =
      orbit.current.following && hasInput
        ? (movementBasis.current ??= orbit.current.yaw)
        : orbit.current.yaw;

    let dx =
      sideways * Math.cos(yaw) -
      forwardInput * Math.sin(yaw);

    let dz =
      -sideways * Math.sin(yaw) -
      forwardInput * Math.cos(yaw);

    if (!paused) {
      if (jumpRequested.current && grounded.current) {
        verticalVelocity.current = 4.0;
        grounded.current = false;
      }

      jumpRequested.current = false;

      if (dx !== 0 || dz !== 0) {
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

        let blocked = false;

        if (terrainRef.current) {
          origin.set(p.x, p.y + 0.6, p.z);

          raycaster.set(
            origin,
            new THREE.Vector3(dx, 0, dz)
          );
          raycaster.far = 0.36;

          blocked = raycaster
            .intersectObject(terrainRef.current, true)
            .some((hit) => {
              const material = (
                hit.object as THREE.Mesh
              ).material;

              const names = Array.isArray(material)
                ? material.map((part) => part.name)
                : [material?.name ?? ""];

              // Decorative vegetation does not block Steve.
              if (
                names.every((name) =>
                  [
                    "Short_Grass",
                    "Dandelion",
                    "Poppy",
                    "Wheat",
                    "Carrot",
                    "Potato",
                  ].includes(name)
                )
              ) {
                return false;
              }

              if (!hit.face || hit.distance <= 0.02) {
                return false;
              }

              const normal = hit.face.normal
                .clone()
                .transformDirection(hit.object.matrixWorld);

              return Math.abs(normal.y) < 0.45;
            });
        }

        if (!blocked) {
          const nextGround = findGround(
            nextX,
            nextZ,
            p.y
          );

          const validStep =
            nextGround !== null &&
            nextGround <= p.y + 0.43 &&
            nextGround >= p.y - 0.8;

          if (!grounded.current || validStep) {
            p.x = nextX;
            p.z = nextZ;

            if (grounded.current && nextGround !== null) {
              p.y = nextGround;
            }
          }
        }

        if (playerRef.current) {
          playerRef.current.rotation.y = Math.atan2(
            -dx,
            -dz
          );
        }
      }

      if (!grounded.current) {
        const previousY = p.y;

        verticalVelocity.current -= 12 * delta;
        p.y += verticalVelocity.current * delta;

        if (verticalVelocity.current <= 0) {
          const floor = findGround(p.x, p.z, p.y);

          if (
            floor !== null &&
            p.y <= floor &&
            previousY >= floor - 0.15
          ) {
            p.y = floor;
            verticalVelocity.current = 0;
            grounded.current = true;
          }
        }
      }

      // Recover from falling outside the navigable world.
      if (p.y < -3) {
        p.set(SPAWN.x, SPAWN.y, SPAWN.z);
        verticalVelocity.current = 0;
        grounded.current = true;
      }
    } else {
      jumpRequested.current = false;
    }

    if (playerRef.current) {
      playerRef.current.position.copy(p);
    }

    // Smooth third-person camera with adjustable orbit.
    target.set(p.x, p.y + 1.0, p.z);

    const settings = orbit.current;

    if (settings.following && playerRef.current) {
      const heading = playerRef.current.rotation.y;

      const difference = Math.atan2(
        Math.sin(heading - settings.yaw),
        Math.cos(heading - settings.yaw)
      );

      settings.yaw += difference * (
        1 - Math.exp(-7 * delta)
      );
    }

    const horizontal =
      Math.cos(settings.pitch) * settings.distance;

    cameraGoal.set(
      target.x + Math.sin(settings.yaw) * horizontal,
      target.y + Math.sin(settings.pitch) * settings.distance,
      target.z + Math.cos(settings.yaw) * horizontal
    );

    // Prevent the camera from remaining behind solid
    // environment geometry when its view is obstructed.
    let obstructed = false;

    if (terrainRef.current) {
      cameraDirection.copy(cameraGoal).sub(target);

      const viewDistance = cameraDirection.length();

      if (viewDistance > 0.001) {
        cameraDirection.divideScalar(viewDistance);
        raycaster.set(target, cameraDirection);
        raycaster.far = viewDistance;

        const obstruction = raycaster
          .intersectObject(terrainRef.current, true)
          .find((hit) => {
            if (hit.distance < 0.12) return false;

            const material = (hit.object as THREE.Mesh).material;

            const names = Array.isArray(material)
              ? material.map((part) => part.name)
              : [material?.name ?? ""];

            const decorative = new Set([
              "Short_Grass",
              "Dandelion",
              "Poppy",
              "Oak_Leaves",
              "Oak_Sapling",
              "Wheat",
              "Carrot",
              "Potato",
              "Sugar_Cane",
            ]);

            return !names.every((name) => decorative.has(name));
          });

        if (obstruction) {
          obstructed = true;

          const safeDistance = Math.max(
            0.8,
            obstruction.distance - 0.2
          );

          cameraGoal
            .copy(target)
            .addScaledVector(cameraDirection, safeDistance);
        }
      }
    }

    if (obstructed) {
      // Snap inward to avoid briefly passing through walls.
      camera.position.copy(cameraGoal);
    } else {
      camera.position.lerp(
        cameraGoal,
        1 - Math.exp(-7 * delta)
      );
    }

    camera.lookAt(target);

    const near =
      Math.hypot(
        p.x - CHEST.x,
        p.z - CHEST.z
      ) < 1.7;

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
          object={worldScene}
          scale={WORLD_SCALE}
        />
      </group>

      <group
        ref={playerRef}
        position={[SPAWN.x, SPAWN.y, SPAWN.z]}
      >
        <primitive
          object={steveScene}
          scale={STEVE_SCALE}
          position={[0, steveOffset, 0]}
          rotation={[0, Math.PI, 0]}
        />
      </group>

      <primitive
        object={chestScene}
        scale={CHEST_SCALE}
        position={[CHEST.x, CHEST.y + chestOffset, CHEST.z]}
      />

      {showChestMarker && (
        <group position={[CHEST.x, CHEST.y + 1.15, CHEST.z]}>
          <mesh renderOrder={100}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshBasicMaterial
              color="#facc15"
              depthTest={false}
              depthWrite={false}
            />
          </mesh>
          <pointLight
            color="#facc15"
            intensity={0.7}
            distance={3}
          />
        </group>
      )}
    </>
  );
}

export default function HouseScene() {
  const orbit = useRef<CameraOrbit>({
    yaw: 0,
    pitch: 0.48,
    distance: 3.3,
    following: true,
  });

  const dragging = useRef<{
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);

  const [following, setFollowing] = useState(true);
  const [showChestMarker, setShowChestMarker] = useState(false);
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
    <div
      className="relative h-full w-full"
      style={{ touchAction: "none" }}
      onPointerDown={(event) => {
        if (!(event.target instanceof HTMLCanvasElement)) return;
        if (event.pointerType === "mouse" && event.button !== 0) {
          return;
        }

        dragging.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
        };

        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const drag = dragging.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        const deltaX = event.clientX - drag.x;
        const deltaY = event.clientY - drag.y;

        if (
          orbit.current.following &&
          (deltaX !== 0 || deltaY !== 0)
        ) {
          orbit.current.following = false;
          setFollowing(false);
        }

        orbit.current.yaw -= deltaX * 0.006;
        orbit.current.pitch = THREE.MathUtils.clamp(
          orbit.current.pitch + deltaY * 0.004,
          0.18,
          1.18
        );

        drag.x = event.clientX;
        drag.y = event.clientY;
      }}
      onPointerUp={(event) => {
        if (dragging.current?.pointerId === event.pointerId) {
          dragging.current = null;
        }

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={() => {
        dragging.current = null;
      }}
    >
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
            orbit={orbit}
            showChestMarker={showChestMarker}
          />
        </Suspense>
      </Canvas>

      {!chestOpen && (
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowChestMarker((value) => !value)}
            aria-pressed={showChestMarker}
            className="min-h-11 border border-neutral-500 bg-black/80 px-3 font-mono text-xs text-white hover:bg-neutral-800"
          >
            {showChestMarker ? "Hide Chest Marker" : "Locate Chest"}
          </button>
          {!following && (
            <button
              type="button"
              onClick={() => {
                orbit.current.following = true;
                setFollowing(true);
              }}
              className="min-h-11 border border-neutral-500 bg-black/80 px-3 font-mono text-xs text-white hover:bg-neutral-800"
            >
              Follow Steve
            </button>
          )}
          <button
            type="button"
            aria-label="Move camera closer"
            onClick={() => {
              orbit.current.distance = Math.max(
                2.5,
                orbit.current.distance - 0.8
              );
            }}
            className="min-h-11 border border-neutral-500 bg-black/80 px-3 font-mono text-xs text-white hover:bg-neutral-800"
          >
            Camera +
          </button>

          <button
            type="button"
            aria-label="Move camera farther away"
            onClick={() => {
              orbit.current.distance = Math.min(
                9,
                orbit.current.distance + 0.8
              );
            }}
            className="min-h-11 border border-neutral-500 bg-black/80 px-3 font-mono text-xs text-white hover:bg-neutral-800"
          >
            Camera -
          </button>
        </div>
      )}

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
