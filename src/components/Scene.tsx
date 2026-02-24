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
      <ambientLight intensity={0.4} />
      {/* Sunlight from the right windows */}
      <directionalLight
        position={[15, 10, 5]}
        intensity={2.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={quality === "high" ? 2048 : 1024}
        shadow-mapSize-height={quality === "high" ? 2048 : 1024}
        shadow-bias={-0.0005}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      {/* Fill light from the left */}
      <directionalLight position={[-10, 5, 0]} intensity={0.5} color="#a0aec0" />
      
      {/* Indoor lights */}
      <pointLight position={[0, 5, -5]} intensity={1.0} color="#ffffff" castShadow />

      <Suspense fallback={null}>
        <Environment preset="city" background blur={0.8} />

        <GymEnvironment />

        {/* Characters */}
        {/* 1. Standing near cable machine */}
        <Character
          id="char1"
          position={[-4, 0, -1]}
          rotation={[0, Math.PI / 4, 0]}
          pose="standing"
        />

        {/* 2. Sitting on Bench */}
        <Character
          id="char2"
          position={[4, 0.45, -2]}
          rotation={[0, Math.PI / 4, 0]}
          pose="sitting"
        />

        {/* 3. Standing near squat rack */}
        <Character
          id="char3"
          position={[7, 0, 3]}
          rotation={[0, -Math.PI / 3, 0]}
          pose="standing"
        />

        {/* 4. Standing near punching bag */}
        <Character
          id="char4"
          position={[5, 0, -8]}
          rotation={[0, Math.PI / 8, 0]}
          pose="standing"
        />

        {/* 5. Standing near cardio */}
        <Character
          id="char5"
          position={[-1, 0, -10]}
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
        <EffectComposer enableNormalPass={true}>
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
