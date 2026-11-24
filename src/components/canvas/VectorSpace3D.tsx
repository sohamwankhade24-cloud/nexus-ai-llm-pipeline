import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Token } from '../../types/pipeline';
import { cosineSimilarity } from '../../services/llmEngine';

interface VectorSpace3DProps {
  tokens: Token[];
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
}

export const VectorSpace3D: React.FC<VectorSpace3DProps> = ({
  tokens,
  selectedToken,
  onSelectToken
}) => {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle floating oscillation
      groupRef.current.rotation.y = time * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Coordinate Grid & Holographic Axes */}
      <gridHelper args={[16, 16, '#00f2fe', '#14233c']} position={[0, -2.5, 0]} />
      
      {/* X, Y, Z Axis Indicator Lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                -5, 0, 0,  5, 0, 0,   // X axis (Cyan)
                0, -4, 0,  0, 4, 0,   // Y axis (Green)
                0, 0, -5,  0, 0, 5    // Z axis (Magenta)
              ]),
              3
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#1e355b" transparent opacity={0.6} />
      </lineSegments>

      {/* Origin Vector Core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.8} />
      </mesh>

      {/* Token Nodes in 3D Space */}
      {tokens.map((token) => {
        const isSelected = selectedToken?.id === token.id;
        const [x, y, z] = token.coords3D;
        const tokenColor = new THREE.Color(token.color);

        // Vector from origin (0,0,0) to token point
        const originLine = new Float32Array([0, 0, 0, x, y, z]);

        return (
          <group key={token.id} position={[x, y, z]}>
            {/* Origin Ray Vector */}
            <lineSegments position={[-x, -y, -z]}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[originLine, 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={token.color}
                transparent
                opacity={isSelected ? 0.8 : 0.25}
              />
            </lineSegments>

            {/* Glowing Token Sphere */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectToken(token);
              }}
              scale={isSelected ? [1.4, 1.4, 1.4] : [1, 1, 1]}
            >
              <sphereGeometry args={[0.22, 32, 32]} />
              <meshStandardMaterial
                color={tokenColor}
                emissive={tokenColor}
                emissiveIntensity={isSelected ? 1.2 : 0.6}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            {/* Pulsing ring if selected */}
            {isSelected && (
              <mesh>
                <ringGeometry args={[0.32, 0.38, 32]} />
                <meshBasicMaterial
                  color="#ffffff"
                  side={THREE.DoubleSide}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            )}

            {/* Futuristic 3D Billboard Label */}
            <Html
              position={[0, 0.45, 0]}
              center
              distanceFactor={8}
              style={{
                pointerEvents: 'none',
                userSelect: 'none'
              }}
            >
              <div
                className={`px-2.5 py-1 rounded-md text-xs font-mono border backdrop-blur-md transition-all duration-300 ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,242,254,0.6)] scale-110 font-bold'
                    : 'bg-space-900/80 border-slate-700/80 text-slate-200 hover:border-cyan-500/50'
                }`}
              >
                <span className="opacity-70 mr-1">#{token.position}</span>
                <span style={{ color: token.color }}>"{token.cleanText}"</span>
              </div>
            </Html>
          </group>
        );
      })}

      {/* Cosine Similarity Connections from Selected Token to Other Tokens */}
      {selectedToken && (
        <group>
          {tokens
            .filter((t) => t.id !== selectedToken.id)
            .map((t) => {
              const sim = cosineSimilarity(selectedToken.finalEmbedding, t.finalEmbedding);
              if (sim < 0.2) return null; // threshold

              const lineCoords = new Float32Array([
                ...selectedToken.coords3D,
                ...t.coords3D
              ]);

              const midX = (selectedToken.coords3D[0] + t.coords3D[0]) / 2;
              const midY = (selectedToken.coords3D[1] + t.coords3D[1]) / 2;
              const midZ = (selectedToken.coords3D[2] + t.coords3D[2]) / 2;

              return (
                <group key={`sim-${selectedToken.id}-${t.id}`}>
                  <lineSegments>
                    <bufferGeometry>
                      <bufferAttribute
                        attach="attributes-position"
                        args={[lineCoords, 3]}
                      />
                    </bufferGeometry>
                    <lineBasicMaterial
                      color="#00f2fe"
                      transparent
                      opacity={Math.max(0.15, sim * 0.75)}
                      linewidth={sim * 2}
                    />
                  </lineSegments>

                  {/* Similarity Badge in 3D */}
                  <Html
                    position={[midX, midY, midZ]}
                    center
                    distanceFactor={9}
                  >
                    <div className="bg-space-950/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded shadow-sm">
                      cos θ = {sim.toFixed(2)}
                    </div>
                  </Html>
                </group>
              );
            })}
        </group>
      )}
    </group>
  );
};
