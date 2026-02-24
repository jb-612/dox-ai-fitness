import React from "react";
import {
  Box,
  Cylinder,
  MeshReflectorMaterial,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";

export const GymEnvironment: React.FC = () => {
  return (
    <group>
      {/* Floor - Rubber Mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 4, -10]} receiveShadow>
        <boxGeometry args={[30, 8, 0.5]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-15, 4, 0]} receiveShadow>
        <boxGeometry args={[0.5, 8, 30]} />
        <meshStandardMaterial color="#1a202c" roughness={0.9} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[15, 4, 0]} receiveShadow>
        <boxGeometry args={[0.5, 8, 30]} />
        <meshStandardMaterial color="#1a202c" roughness={0.9} />
      </mesh>

      {/* Large Mirror on Back Wall */}
      <mesh position={[0, 3, -9.7]} receiveShadow>
        <planeGeometry args={[16, 4]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={50}
          roughness={0.05}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#a0aec0"
          metalness={0.8}
          mirror={1}
        />
      </mesh>

      {/* Gym Props - Bench 1 */}
      <group position={[-4, 0, -4]} rotation={[0, Math.PI / 4, 0]}>
        {/* Frame */}
        <Box
          args={[0.4, 0.4, 1.4]}
          position={[0, 0.2, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#2d3748"
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
        {/* Pad */}
        <RoundedBox
          args={[0.5, 0.1, 1.5]}
          position={[0, 0.45, 0]}
          radius={0.05}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#111" roughness={0.7} />
        </RoundedBox>
        {/* Backrest */}
        <RoundedBox
          args={[0.5, 0.8, 0.1]}
          position={[0, 0.85, -0.7]}
          radius={0.05}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#111" roughness={0.7} />
        </RoundedBox>
      </group>

      {/* Gym Props - Bench 2 */}
      <group position={[5, 0, -2]} rotation={[0, -Math.PI / 6, 0]}>
        <Box
          args={[0.4, 0.4, 1.4]}
          position={[0, 0.2, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#2d3748"
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
        <RoundedBox
          args={[0.5, 0.1, 1.5]}
          position={[0, 0.45, 0]}
          radius={0.05}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#111" roughness={0.7} />
        </RoundedBox>
      </group>

      {/* Dumbbell Rack */}
      <group position={[8, 0, -8]}>
        {/* Rack Frame */}
        <Box
          args={[4, 1.2, 0.6]}
          position={[0, 0.6, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#4a5568"
            metalness={0.7}
            roughness={0.3}
          />
        </Box>
        {/* Dumbbells on rack */}
        {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
          <group key={i} position={[x, 1.3, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.4]} />
              <meshStandardMaterial
                color="#cbd5e0"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <Cylinder
              args={[0.15, 0.15, 0.1, 6]}
              position={[-0.2, 0, 0]}
              rotation={[Math.PI / 2, 0, Math.PI / 2]}
              castShadow
            >
              <meshStandardMaterial color="#1a202c" roughness={0.8} />
            </Cylinder>
            <Cylinder
              args={[0.15, 0.15, 0.1, 6]}
              position={[0.2, 0, 0]}
              rotation={[Math.PI / 2, 0, Math.PI / 2]}
              castShadow
            >
              <meshStandardMaterial color="#1a202c" roughness={0.8} />
            </Cylinder>
          </group>
        ))}
      </group>

      {/* Yoga Mats */}
      <RoundedBox
        args={[1.2, 0.02, 2.5]}
        position={[-6, 0.01, 4]}
        rotation={[0, Math.PI / 8, 0]}
        radius={0.05}
        receiveShadow
      >
        <meshStandardMaterial color="#6b46c1" roughness={0.9} />
      </RoundedBox>
      <RoundedBox
        args={[1.2, 0.02, 2.5]}
        position={[-3, 0.01, 5]}
        rotation={[0, -Math.PI / 12, 0]}
        radius={0.05}
        receiveShadow
      >
        <meshStandardMaterial color="#38a169" roughness={0.9} />
      </RoundedBox>

      {/* Kettlebells */}
      <group position={[-8, 0, -6]}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[i * 0.6, 0.15, 0]}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.15, 32, 32]} />
              <meshStandardMaterial
                color="#1a202c"
                roughness={0.6}
                metalness={0.4}
              />
            </mesh>
            <mesh position={[0, 0.15, 0]} castShadow>
              <torusGeometry args={[0.08, 0.03, 16, 32]} />
              <meshStandardMaterial
                color="#1a202c"
                roughness={0.6}
                metalness={0.4}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
