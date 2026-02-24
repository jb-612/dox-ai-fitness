import React, { Suspense, useRef, useEffect } from "react";
import { Environment, CameraControls, ContactShadows } from "@react-three/drei";
import { GymEnvironment } from "./GymEnvironment";
import { Character } from "./Character";
import { useStore } from "../store";
import {
  EffectComposer,
  SSAO,
  Bloom,
  ToneMapping,
  SMAA,
} from "@react-three/postprocessing";

export const Scene: React.FC = () => {
  const cameraControlsRef = useRef<any>(null);
  const quality = useStore((state) => state.quality);
  const cameraTarget = useStore((state) => state.cameraTarget);

  useEffect(() => {
    if (cameraControlsRef.current) {
      // Set boundaries
      cameraControlsRef.current.minDistance = 1;
      cameraControlsRef.current.maxDistance = 15;
      cameraControlsRef.current.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below floor
      cameraControlsRef.current.minAzimuthAngle = -Math.PI / 3;
      cameraControlsRef.current.maxAzimuthAngle = Math.PI / 3;

      // Smoothly move to target if set
      if (cameraTarget) {
        cameraControlsRef.current.setTarget(
          cameraTarget[0],
          cameraTarget[1],
          cameraTarget[2],
          true,
        );
      } else {
        cameraControlsRef.current.setTarget(0, 1.5, -2, true);
      }
    }
  }, [cameraTarget]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={quality === "high" ? 2048 : 1024}
        shadow-mapSize-height={quality === "high" ? 2048 : 1024}
        shadow-bias={-0.0001}
      />
      <pointLight
        position={[-5, 5, -5]}
        intensity={0.8}
        color="#a0aec0"
        castShadow
      />
      <pointLight
        position={[5, 5, -5]}
        intensity={0.8}
        color="#a0aec0"
        castShadow
      />

      <Suspense fallback={null}>
        <Environment preset="city" background blur={0.8} />

        <GymEnvironment />

        {/* Characters */}
        {/* 1. Standing near mirror */}
        <Character
          id="char1"
          position={[-2, 0, -7]}
          rotation={[0, Math.PI / 4, 0]}
          pose="standing"
        />

        {/* 2. Sitting on Bench 1 */}
        <Character
          id="char2"
          position={[-4, 0.45, -4]}
          rotation={[0, Math.PI / 4, 0]}
          pose="sitting"
        />

        {/* 3. Standing near dumbbells */}
        <Character
          id="char3"
          position={[6, 0, -6]}
          rotation={[0, -Math.PI / 3, 0]}
          pose="standing"
        />

        {/* 4. Sitting on Yoga Mat */}
        <Character
          id="char4"
          position={[-6, 0.02, 4]}
          rotation={[0, Math.PI / 8, 0]}
          pose="sitting"
        />

        {/* 5. Standing in middle, looking towards camera */}
        <Character
          id="char5"
          position={[2, 0, 1]}
          rotation={[0, -Math.PI / 8, 0]}
          pose="standing"
        />

        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.6}
          scale={30}
          blur={2}
          far={4}
        />
      </Suspense>

      {/* Camera Controls */}
      <CameraControls
        ref={cameraControlsRef}
        makeDefault
        dollySpeed={1.5}
        azimuthRotateSpeed={0.5}
        polarRotateSpeed={0.5}
      />

      {/* Post Processing */}
      {quality !== "low" && (
        <EffectComposer enableNormalPass={false}>
          <SSAO
            samples={quality === "high" ? 31 : 16}
            radius={0.1}
            intensity={20}
            luminanceInfluence={0.6}
          />
          <Bloom luminanceThreshold={1} mipmapBlur intensity={0.5} />
          <ToneMapping />
          <SMAA />
        </EffectComposer>
      )}
    </>
  );
};
