import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useGraph } from "@react-three/fiber";
import { useGLTF, useAnimations, Text } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { playRandomGreeting } from "../utils/audio";
import { useStore } from "../store";

interface CharacterProps {
  id: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  pose: "standing" | "sitting";
}

const MODEL_URL =
  "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Soldier.glb";

export const Character: React.FC<CharacterProps> = ({
  id,
  position,
  rotation = [0, 0, 0],
  pose,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Object3D>(null);
  const [hovered, setHovered] = useState(false);
  const [animating, setAnimating] = useState(false);
  const animationTime = useRef(0);
  const muted = useStore((state) => state.muted);

  // Load model and animations
  const { scene, materials, animations } = useGLTF(MODEL_URL);

  // Clone the scene for multiple instances
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);

  const { actions, mixer } = useAnimations(animations, groupRef);

  useEffect(() => {
    // Enable shadows for all meshes in the cloned scene
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Find the head bone for interaction and look-at
    headRef.current = clone.getObjectByName("mixamorigHead") || null;

    // Adjust pose if sitting
    if (pose === "sitting") {
      const leftUpLeg = clone.getObjectByName("mixamorigLeftUpLeg");
      const rightUpLeg = clone.getObjectByName("mixamorigRightUpLeg");
      const leftLeg = clone.getObjectByName("mixamorigLeftLeg");
      const rightLeg = clone.getObjectByName("mixamorigRightLeg");

      if (leftUpLeg) leftUpLeg.rotation.x -= Math.PI / 2;
      if (rightUpLeg) rightUpLeg.rotation.x -= Math.PI / 2;
      if (leftLeg) leftLeg.rotation.x += Math.PI / 2;
      if (rightLeg) rightLeg.rotation.x += Math.PI / 2;

      // Move down slightly
      clone.position.y -= 0.6;
    }

    // Play idle animation
    if (actions["Idle"]) {
      actions["Idle"].reset().fadeIn(0.5).play();
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [clone, actions, mixer, pose]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (!animating && groupRef.current) {
      setAnimating(true);
      animationTime.current = 0;

      // Play audio
      const camera = e.camera;
      const charPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(charPos);
      playRandomGreeting(camera.position, charPos, muted);

      // Set camera target to look at the character's head
      useStore
        .getState()
        .setCameraTarget([charPos.x, charPos.y + 1.5, charPos.z]);
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
    } else if (headRef.current && hovered && !animating) {
      // Look at camera when hovered
      const target = new THREE.Vector3();
      state.camera.getWorldPosition(target);

      // Convert world target to local space of the head's parent
      if (headRef.current.parent) {
        headRef.current.parent.worldToLocal(target);
      }

      // Smoothly look at target
      const currentRotation = new THREE.Quaternion().copy(
        headRef.current.quaternion,
      );
      headRef.current.lookAt(target);
      const targetRotation = new THREE.Quaternion().copy(
        headRef.current.quaternion,
      );

      headRef.current.quaternion.slerpQuaternions(
        currentRotation,
        targetRotation,
        0.1,
      );

      // Constrain rotation to avoid exorcist neck
      headRef.current.rotation.z = 0;
      headRef.current.rotation.x = THREE.MathUtils.clamp(
        headRef.current.rotation.x,
        -0.5,
        0.5,
      );
      headRef.current.rotation.y = THREE.MathUtils.clamp(
        headRef.current.rotation.y,
        -0.8,
        0.8,
      );
    } else if (headRef.current && !animating) {
      // Smoothly return to neutral
      const currentRotation = new THREE.Quaternion().copy(
        headRef.current.quaternion,
      );
      const neutralRotation = new THREE.Quaternion();
      headRef.current.quaternion.slerpQuaternions(
        currentRotation,
        neutralRotation,
        0.05,
      );
    }
  });

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      dispose={null}
    >
      <primitive object={clone} />

      {/* Invisible interaction hotspot over the head */}
      <mesh
        position={[0, pose === "standing" ? 1.6 : 1.0, 0]}
        visible={false}
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
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>

      {/* Hover Indicator */}
      {hovered && (
        <Text
          position={[0, pose === "standing" ? 2.1 : 1.5, 0]}
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
    </group>
  );
};

useGLTF.preload(MODEL_URL);
