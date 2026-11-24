import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NeuralBrain3DProps {
  isPulsing?: boolean;
}

export const NeuralBrain3D: React.FC<NeuralBrain3DProps> = ({ isPulsing = true }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  // Generate anatomical cortex-like point cloud
  const { nodePositions, linePositions, colors } = useMemo(() => {
    const numPoints = 1600;
    const positions = new Float32Array(numPoints * 3);
    const colorArray = new Float32Array(numPoints * 3);

    const pointCoords: THREE.Vector3[] = [];
    const cyan = new THREE.Color('#00f2fe');
    const violet = new THREE.Color('#7f00ff');
    const magenta = new THREE.Color('#e100ff');

    let idx = 0;
    for (let i = 0; i < numPoints; i++) {
      // Hemisphere sign: left (-1) or right (+1) with gap in middle
      const hemisphere = i % 2 === 0 ? 1 : -1;

      // Brain cortex spherical coordinates with natural cranial shaping
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      const r = 2.4 + (Math.sin(theta * 3) * Math.cos(phi * 4)) * 0.45;
      
      // Squash and shape like human cerebrum
      let x = r * Math.sin(phi) * Math.cos(theta) * 0.9;
      let y = r * Math.sin(phi) * Math.sin(theta) * 0.85;
      let z = r * Math.cos(phi) * 1.3;

      // Separate hemispheres and indent longitudinal fissure
      x = hemisphere * (Math.abs(x) * 0.8 + 0.35);

      // Cerebellum curvature
      if (z < -0.8 && y < 0) {
        y *= 1.2;
      }

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;

      pointCoords.push(new THREE.Vector3(x, y, z));

      // Color gradient from cyan to violet/magenta based on height and hemisphere
      const mixRatio = (y + 2) / 4;
      const baseColor = hemisphere > 0 ? cyan.clone().lerp(magenta, mixRatio) : violet.clone().lerp(cyan, mixRatio);

      colorArray[idx * 3] = baseColor.r;
      colorArray[idx * 3 + 1] = baseColor.g;
      colorArray[idx * 3 + 2] = baseColor.b;

      idx++;
    }

    // Connect close neurons with synaptic fiber lines
    const lineIndices: number[] = [];
    const maxDistance = 0.55;
    for (let i = 0; i < pointCoords.length; i++) {
      let connections = 0;
      for (let j = i + 1; j < pointCoords.length; j++) {
        const dist = pointCoords[i].distanceTo(pointCoords[j]);
        if (dist < maxDistance && connections < 3) {
          lineIndices.push(
            pointCoords[i].x, pointCoords[i].y, pointCoords[i].z,
            pointCoords[j].x, pointCoords[j].y, pointCoords[j].z
          );
          connections++;
        }
      }
    }

    return {
      nodePositions: positions,
      linePositions: new Float32Array(lineIndices),
      colors: colorArray
    };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Smooth continuous holographic rotation
      groupRef.current.rotation.y = time * 0.18;
      groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.08;
      
      // Floating hover motion
      groupRef.current.position.y = Math.sin(time * 0.6) * 0.08;
    }

    if (pointsRef.current && isPulsing) {
      // Pulse point sizes and breathing effect
      const scale = 1 + Math.sin(time * 2.5) * 0.03;
      pointsRef.current.scale.set(scale, scale, scale);
    }

    if (coreRef.current) {
      const coreScale = 0.8 + Math.sin(time * 3.5) * 0.15;
      coreRef.current.scale.set(coreScale, coreScale, coreScale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Neural Pulse Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial
          color="#00f2fe"
          transparent
          opacity={0.18}
          wireframe
        />
      </mesh>

      {/* Synaptic Neuron Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[nodePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          vertexColors
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Synaptic Axon Connections */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#4facfe"
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Surrounding Cybernetic Rings */}
      <group rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[3.2, 0.015, 16, 100]} />
          <meshBasicMaterial color="#00f2fe" transparent opacity={0.3} />
        </mesh>
      </group>
      <group rotation={[-Math.PI / 5, Math.PI / 6, 0]}>
        <mesh>
          <torusGeometry args={[3.5, 0.012, 16, 100]} />
          <meshBasicMaterial color="#e100ff" transparent opacity={0.25} />
        </mesh>
      </group>
    </group>
  );
};
