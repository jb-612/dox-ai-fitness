import React from "react";
import { Box } from "@react-three/drei";

export const GymEnvironment: React.FC = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 3, -10]} receiveShadow>
        <boxGeometry args={[20, 6, 0.5]} />
        <meshStandardMaterial color="#4a5568" roughness={0.9} />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-10, 3, 0]} receiveShadow>
        <boxGeometry args={[0.5, 6, 20]} />
        <meshStandardMaterial color="#2d3748" roughness={0.9} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[10, 3, 0]} receiveShadow>
        <boxGeometry args={[0.5, 6, 20]} />
        <meshStandardMaterial color="#2d3748" roughness={0.9} />
      </mesh>

      {/* Mirror on Back Wall */}
      <mesh position={[0, 2.5, -9.7]} receiveShadow>
        <boxGeometry args={[12, 3, 0.1]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Gym Props - Bench 1 */}
      <group position={[-4, 0, -4]} rotation={[0, Math.PI / 4, 0]}>
        <Box
          args={[0.6, 0.4, 1.5]}
          position={[0, 0.2, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#1a202c" />
        </Box>
        <Box
          args={[0.6, 0.8, 0.1]}
          position={[0, 0.6, -0.7]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#1a202c" />
        </Box>
      </group>

      {/* Gym Props - Bench 2 */}
      <group position={[5, 0, -2]} rotation={[0, -Math.PI / 6, 0]}>
        <Box
          args={[0.6, 0.4, 1.5]}
          position={[0, 0.2, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#1a202c" />
        </Box>
      </group>

      {/* Dumbbell Rack */}
      <group position={[8, 0, -8]}>
        <Box args={[3, 1, 0.6]} position={[0, 0.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial
            color="#718096"
            metalness={0.6}
            roughness={0.4}
          />
        </Box>
        {/* Dumbbells on rack */}
        {[-1, 0, 1].map((x, i) => (
          <group key={i} position={[x, 1.1, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.4]} />
              <meshStandardMaterial color="#a0aec0" metalness={0.8} />
            </mesh>
            <mesh position={[-0.2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.1]} />
              <meshStandardMaterial color="#1a202c" />
            </mesh>
            <mesh position={[0.2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.1]} />
              <meshStandardMaterial color="#1a202c" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Yoga Mats */}
      <mesh
        position={[-6, 0.01, 4]}
        rotation={[-Math.PI / 2, 0, Math.PI / 8]}
        receiveShadow
      >
        <planeGeometry args={[1, 2.5]} />
        <meshStandardMaterial color="#9f7aea" roughness={0.9} />
      </mesh>
      <mesh
        position={[-3, 0.01, 5]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 12]}
        receiveShadow
      >
        <planeGeometry args={[1, 2.5]} />
        <meshStandardMaterial color="#48bb78" roughness={0.9} />
      </mesh>
    </group>
  );
};
