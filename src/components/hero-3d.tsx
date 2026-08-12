"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"

function Stars(props: any) {
  const ref = useRef<any>(null)

  // Generate particle positions manually to avoid NaN issues
  const positions = useMemo(() => {
    const positions = new Float32Array(3000) // 1000 particles * 3 coordinates

    for (let i = 0; i < 3000; i += 3) {
      // Generate random positions in a sphere
      const radius = Math.random() * 2 + 0.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i] = radius * Math.sin(phi) * Math.cos(theta) // x
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta) // y
      positions[i + 2] = radius * Math.cos(phi) // z
    }

    return positions
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10
      ref.current.rotation.y -= delta / 15
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#4A90E2" size={0.003} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  )
}

function FloatingCube() {
  const meshRef = useRef<any>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4A90E2" transparent opacity={0.4} wireframe />
    </mesh>
  )
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Stars />
        <FloatingCube />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
      </Canvas>
    </div>
  )
}
