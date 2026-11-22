"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  Center,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";

const WORLD_URL = "/models/soulwitchs-world.glb";

function WorldModel({
  onReady,
}: {
  onReady: () => void;
}) {
  const { scene } = useGLTF(WORLD_URL);

  // An independent instance prevents the cached GLB
  // from accumulating transforms between preview visits.
  const instance = useMemo(
    () => scene.clone(true),
    [scene]
  );

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <Center>
      <primitive object={instance} />
    </Center>
  );
}

export default function WorldCanvas({
  onReady,
}: {
  onReady: () => void;
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
        <Bounds fit clip observe margin={1.25}>
          <WorldModel onReady={onReady} />
        </Bounds>
      </Suspense>
    </Canvas>
  );
}
