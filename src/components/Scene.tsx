import React, { Suspense } from "react";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  ContactShadows,
} from "@react-three/drei";
import { GymEnvironment } from "./GymEnvironment";
import { Character } from "./Character";

export const Scene: React.FC = () => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.8} color="#a0aec0" />
      <pointLight position={[5, 5, -5]} intensity={0.8} color="#a0aec0" />

      <Suspense fallback={null}>
        <Environment preset="city" />

        <GymEnvironment />

        {/* Characters */}
        {/* 1. Standing near mirror */}
        <Character
          id="char1"
          position={[-2, 0, -7]}
          rotation={[0, Math.PI / 4, 0]}
          color="#e53e3e"
          pose="standing"
        />

        {/* 2. Sitting on Bench 1 */}
        <Character
          id="char2"
          position={[-4, 0.2, -4]}
          rotation={[0, Math.PI / 4, 0]}
          color="#3182ce"
          pose="sitting"
        />

        {/* 3. Standing near dumbbells */}
        <Character
          id="char3"
          position={[6, 0, -6]}
          rotation={[0, -Math.PI / 3, 0]}
          color="#38a169"
          pose="standing"
        />

        {/* 4. Sitting on Yoga Mat */}
        <Character
          id="char4"
          position={[-6, 0, 4]}
          rotation={[0, Math.PI / 8, 0]}
          color="#d69e2e"
          pose="sitting"
        />

        {/* 5. Standing in middle, looking towards camera */}
        <Character
          id="char5"
          position={[2, 0, 1]}
          rotation={[0, -Math.PI / 8, 0]}
          color="#805ad5"
          pose="standing"
        />

        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.4}
          scale={20}
          blur={2}
          far={4}
        />
      </Suspense>

      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2 - 0.05} // Don't go below floor
        minAzimuthAngle={-Math.PI / 3} // Restrict rotation to keep "fourth wall" feel
        maxAzimuthAngle={Math.PI / 3}
        target={[0, 1.5, -2]} // Look slightly into the room
      />
    </>
  );
};
