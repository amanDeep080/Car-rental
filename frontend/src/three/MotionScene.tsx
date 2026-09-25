"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const STREAK_COUNT = 220;

function LightStreaks() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { viewport, pointer } = useThree();

  const seeds = useMemo(
    () =>
      Array.from({ length: STREAK_COUNT }, () => ({
        x: (Math.random() - 0.5) * 18,
        y: (Math.random() - 0.5) * 9,
        z: (Math.random() - 0.5) * 6,
        speed: 4 + Math.random() * 7,
        len: 0.6 + Math.random() * 2.2,
      })),
    []
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const parallaxX = pointer.x * 0.6;
    const parallaxY = pointer.y * 0.3;

    seeds.forEach((s, i) => {
      s.x -= s.speed * delta;
      if (s.x < -10) s.x = 10;

      dummy.position.set(s.x + parallaxX, s.y + parallaxY, s.z);
      dummy.scale.set(s.len, 0.014, 0.014);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, STREAK_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#C98A3B" transparent opacity={0.45} />
    </instancedMesh>
  );
}

export default function MotionScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.4} />
      <LightStreaks />
    </Canvas>
  );
}
