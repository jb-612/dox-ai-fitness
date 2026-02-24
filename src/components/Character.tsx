import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { playRandomGreeting } from "../utils/audio";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface CharacterProps {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  pose: "standing" | "sitting";
}

export const Character: React.FC<CharacterProps> = ({
  id,
  position,
  rotation = [0, 0, 0],
  color,
  pose,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [animating, setAnimating] = useState(false);
  const animationTime = useRef(0);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!animating) {
      setAnimating(true);
      animationTime.current = 0;
      playRandomGreeting();
    }
  };

  useFrame((state, delta) => {
    if (animating && headRef.current) {
      animationTime.current += delta;

      // Simple reaction animation: head bobs and looks around
      const t = animationTime.current;
      headRef.current.rotation.y = Math.sin(t * 10) * 0.3;
      headRef.current.rotation.x = Math.sin(t * 15) * 0.2;

      if (t > 2) {
        // Animation duration 2 seconds
        setAnimating(false);
        headRef.current.rotation.set(0, 0, 0);
      }
    } else if (headRef.current) {
      // Idle breathing animation
      const t = state.clock.getElapsedTime();
      headRef.current.position.y =
        (pose === "standing" ? 1.4 : 0.8) +
        Math.sin(t * 2 + position[0]) * 0.02;
    }

    // Body breathing
    if (groupRef.current && !animating) {
      const t = state.clock.getElapsedTime();
      groupRef.current.scale.y = 1 + Math.sin(t * 2 + position[0]) * 0.01;
    }
  });

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  const bodyY = pose === "standing" ? 0.6 : 0.3;
  const headY = pose === "standing" ? 1.4 : 0.8;
  const bodyHeight = pose === "standing" ? 1.2 : 0.6;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Body */}
      <mesh position={[0, bodyY, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.25, bodyHeight - 0.5, 4, 16]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* Head (Clickable Hotspot) */}
      <mesh
        ref={headRef}
        position={[0, headY, 0]}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          color="#ffccaa"
          roughness={0.4}
          emissive={hovered ? "#444444" : "#000000"}
        />

        {/* Eyes */}
        <mesh position={[-0.07, 0.05, 0.17]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.07, 0.05, 0.17]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Hover Indicator */}
        {hovered && (
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            Click to talk
          </Text>
        )}
      </mesh>
    </group>
  );
};
