import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Token, AttentionData } from '../../types/pipeline';

interface AttentionArcs3DProps {
  tokens: Token[];
  attentionData: AttentionData;
  selectedHead: number; // 0..3 or -1 for average
  threshold: number;
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
}

export const AttentionArcs3D: React.FC<AttentionArcs3DProps> = ({
  tokens,
  attentionData,
  selectedHead,
  threshold,
  selectedToken,
  onSelectToken
}) => {
  const groupRef = useRef<THREE.Group>(null!);

  // Position tokens along a futuristic circular carousel on the X-Z plane
  const token3DPositions = useMemo(() => {
    const radius = 4.2;
    const len = tokens.length;
    return tokens.map((token, i) => {
      const angle = (i / len) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0;
      return { token, x, y, z, angle };
    });
  }, [tokens]);

  // Matrix to display: specific head or average
  const currentMatrix = useMemo(() => {
    if (selectedHead >= 0 && attentionData.heads[selectedHead]) {
      return attentionData.heads[selectedHead].attentionWeights;
    }
    return attentionData.averageMatrix;
  }, [attentionData, selectedHead]);

  // Generate 3D quadratic Bezier arcs between tokens
  const arcs = useMemo(() => {
    const list: {
      fromIdx: number;
      toIdx: number;
      weight: number;
      curvePoints: THREE.Vector3[];
      midPoint: THREE.Vector3;
    }[] = [];

    const len = tokens.length;
    for (let i = 0; i < len; i++) {
      for (let j = 0; j < len; j++) {
        // Filter by token selection if one is active
        if (selectedToken && tokens[i].id !== selectedToken.id && tokens[j].id !== selectedToken.id) {
          continue;
        }

        const weight = currentMatrix[i]?.[j] ?? 0;
        if (weight >= threshold && i !== j) {
          const p1 = new THREE.Vector3(token3DPositions[i].x, 0, token3DPositions[i].z);
          const p2 = new THREE.Vector3(token3DPositions[j].x, 0, token3DPositions[j].z);

          // Height of the arc proportional to distance across circle
          const dist = p1.distanceTo(p2);
          const height = Math.min(3.5, 0.8 + dist * 0.4);
          const midX = (p1.x + p2.x) / 2;
          const midZ = (p1.z + p2.z) / 2;
          const controlPoint = new THREE.Vector3(midX, height, midZ);

          const curve = new THREE.QuadraticBezierCurve3(p1, controlPoint, p2);
          const curvePoints = curve.getPoints(24);

          list.push({
            fromIdx: i,
            toIdx: j,
            weight,
            curvePoints,
            midPoint: controlPoint
          });
        }
      }
    }
    return list;
  }, [tokens, currentMatrix, threshold, selectedToken, token3DPositions]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Pedestal holographic base ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[3.8, 4.6, 64]} />
        <meshBasicMaterial color="#00f2fe" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {/* Tokens around perimeter */}
      {token3DPositions.map(({ token, x, y, z }) => {
        const isSelected = selectedToken?.id === token.id;

        return (
          <group key={token.id} position={[x, y, z]}>
            {/* Holographic vertical light beacon */}
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
              <meshBasicMaterial color={token.color} transparent opacity={isSelected ? 0.8 : 0.3} />
            </mesh>

            {/* Token Node Platform */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectToken(token);
              }}
              position={[0, 0.1, 0]}
            >
              <cylinderGeometry args={[0.25, 0.3, 0.15, 16]} />
              <meshStandardMaterial
                color={token.color}
                emissive={token.color}
                emissiveIntensity={isSelected ? 1.5 : 0.5}
              />
            </mesh>

            {/* Token Label */}
            <Html
              position={[0, 1.5, 0]}
              center
              distanceFactor={8}
            >
              <div
                onClick={() => onSelectToken(token)}
                className={`cursor-pointer px-2 py-0.5 rounded text-xs font-mono border backdrop-blur-md transition-all ${
                  isSelected
                    ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_12px_rgba(0,242,254,0.7)] scale-110'
                    : 'bg-space-950/80 border-slate-700/80 text-slate-300 hover:border-cyan-400'
                }`}
              >
                "{token.cleanText}"
              </div>
            </Html>
          </group>
        );
      })}

      {/* 3D Attention Arcs */}
      {arcs.map((arc, idx) => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(arc.curvePoints);
        const fromColor = tokens[arc.fromIdx].color;
        const lineMaterial = new THREE.LineBasicMaterial({
          color: fromColor,
          transparent: true,
          opacity: Math.min(0.9, 0.2 + arc.weight * 0.8),
          linewidth: Math.max(1, arc.weight * 3),
          blending: THREE.AdditiveBlending
        });
        const lineObj = new THREE.Line(lineGeo, lineMaterial);

        return (
          <group key={`arc-${idx}`}>
            <primitive object={lineObj} />
            
            {/* Arc Weight Badge if weight is high */}
            {arc.weight > 0.25 && (
              <Html
                position={[arc.midPoint.x, arc.midPoint.y, arc.midPoint.z]}
                center
                distanceFactor={10}
              >
                <div className="bg-space-950/90 border border-cyan-500/50 text-[9px] font-mono text-cyan-300 px-1 py-0.2 rounded shadow">
                  {(arc.weight * 100).toFixed(0)}%
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};
