"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh, Group } from "three";

function GoldForm() {
  const meshRef = useRef<Mesh>(null);
  const shellRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.18;
      meshRef.current.rotation.x += delta * 0.05;
    }
    if (shellRef.current) {
      shellRef.current.rotation.y -= delta * 0.08;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.9}>
      {/* Solid distorted core with a brushed-gold material */}
      <Icosahedron ref={meshRef} args={[1.35, 6]}>
        <MeshDistortMaterial
          color="#b68a4e"
          emissive="#5c3f17"
          emissiveIntensity={0.25}
          metalness={0.95}
          roughness={0.22}
          distort={0.32}
          speed={1.3}
        />
      </Icosahedron>

      {/* Faceted wireframe shell for a jewel-like silhouette */}
      <group ref={shellRef}>
        <Icosahedron args={[1.95, 1]}>
          <meshBasicMaterial color="#ccab79" wireframe transparent opacity={0.18} />
        </Icosahedron>
      </group>
    </Float>
  );
}

export function HeroScene({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} color="#fff4dd" />
        <pointLight position={[-5, -3, 2]} intensity={1.4} color="#0c3563" />
        <pointLight position={[3, -2, -4]} intensity={0.8} color="#b3242b" />
        <GoldForm />
      </Canvas>
    </div>
  );
}
