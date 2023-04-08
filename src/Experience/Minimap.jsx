import * as THREE from 'three'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScroll, Edges, useCursor } from '@react-three/drei'

const damp = THREE.MathUtils.damp

function Item({ scroll, index, hovered }) {
  return (
    <mesh
      onClick={() => {
        scroll.el.scrollTo({ top: index * window.innerHeight * 1.15 })
      }}
      position-y={index * -0.25}
    >
      <planeGeometry args={[0.4, 0.3]} />
      <meshBasicMaterial opacity={0} transparent />
      <Edges scale={0.7}>
        <meshBasicMaterial
          transparent
          opacity={hovered ? 1.0 : 0.2}
          color="white"
          depthTest={false}
        />
      </Edges>
    </mesh>
  )
}

function Minimap({ urls }) {
  const groupRef = useRef()
  const viewRef = useRef()
  const scroll = useScroll()
  const [hovered, setHovered] = useState()
  useCursor(hovered)

  useFrame((state, delta) => {
    groupRef.current.children.forEach((child, index) => {
      const y = scroll.curve(
        index / urls.length - 1 / urls.length,
        2 / urls.length,
        0.08
      )
      child.children[0].material.opacity = damp(
        child.material.opacity,
        0.2 + y,
        8,
        8,
        delta
      )
    })
    viewRef.current.position.y = -scroll.scroll.current
  })

  return (
    <>
      <group position-z={0.2} position-x={-6}>
        <group
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          ref={groupRef}
        >
          {urls.map((item, index) => (
            <Item key={index} scroll={scroll} index={index} hovered={hovered} />
          ))}
        </group>

        <mesh
          ref={viewRef}
          onClick={(event) => event.stopPropagation()}
          onPointerEnter={(event) => event.stopPropagation()}
        >
          <planeGeometry args={[0.4, 0.3]} />
          <meshBasicMaterial opacity={0} transparent />
          <Edges scale={1.1}>
            <meshBasicMaterial transparent color="white" depthTest={false} />
          </Edges>
        </mesh>
      </group>
    </>
  )
}

export default Minimap
