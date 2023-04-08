import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import {
  ScrollControls,
  Scroll,
  shaderMaterial,
  useTexture,
} from '@react-three/drei'
import { Vignette, EffectComposer } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import Minimap from './Minimap'
import { easing } from 'maath'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'

const PortalMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: { value: null },
    uMeshSize: new THREE.Vector2(0, 0),
    uImageSize: new THREE.Vector2(0, 0),
    uCurve: { value: 0.03 },
  },
  // vertex shader
  /*glsl*/ `  
  uniform float uTime;
  uniform float uCurve;
  varying vec2 vUv;

  #define PI 3.1415926535897932384626433832795

  void main() {
    vUv = uv;

    vec3 newPosition = position;

    float distanceFromCenter = abs((modelMatrix * vec4(position, 1.0)).y);

    newPosition.x *= 1.0 + 0.2 * pow(distanceFromCenter,2.0) * uCurve;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
  `,
  // fragment shader
  /*glsl*/ `
    uniform sampler2D uTexture;
    uniform vec2 uImageSize;
    uniform vec2 uMeshSize;
    uniform float uTime;
    varying vec2 vUv;

    vec2 cover(vec2 uv, vec2 textureSize, vec2 meshSize){
      vec2 newUv = uv - vec2(0.5);
  
      float meshAspect = meshSize.x/meshSize.y;
      float textureAspect = textureSize.x/textureSize.y;
      if(meshAspect<textureAspect){
          newUv = newUv*vec2(meshAspect/textureAspect,1.);
      } else{
          newUv = newUv*vec2(1.,textureAspect/meshAspect);
      }
  
      newUv += vec2(0.5);
      return newUv;
  }
  
    

    void main() {
      vec2 uv = cover(vUv,uImageSize, uMeshSize);
      gl_FragColor = texture2D(uTexture, uv);
    }
  `
)

// declaratively
extend({ PortalMaterial })

function Slide({ url, ...props }) {
  const { width, height } = useThree((state) => state.viewport)
  const texture = useTexture(url)
  const meshRef = useRef()

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uImageSize.value.x = texture.image.width
      meshRef.current.material.uniforms.uImageSize.value.y =
        texture.image.height
      meshRef.current.material.uniforms.uMeshSize.value.x =
        meshRef.current.scale.x
      meshRef.current.material.uniforms.uMeshSize.value.y =
        meshRef.current.scale.y
    }
  })

  return (
    <mesh ref={meshRef} {...props} scale={[width * 0.6, height * 0.8, 1]}>
      <planeGeometry args={[1, 1, 10, 10]} />
      <portalMaterial
        uTexture={texture}
        uCurve={width / height >= 1 ? 0.03 : 0.2}
        attach="material"
      />
    </mesh>
  )
}

function Tilt({ children }) {
  // { fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }
  const ref = useRef()

  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [0, 0, 5], 75, delta)
    easing.dampE(
      ref.current.rotation,
      [state.pointer.y / 16, -state.pointer.x / 16, 0],
      0.25,
      delta
    )
  })
  return <group ref={ref}>{children}</group>
}

export default function Experience() {
  const urls = ['/1.jpg', '/2.jpg', '/3.jpg', '/4.jpg', '/5.jpg']

  const { width, height } = useThree((state) => state.viewport)
  const bridgeRef = useRef()
  const offset = 0.1

  return (
    <>
      {/* <Perf /> */}
      <color attach="background" args={['#000000']} />
      <ScrollControls pages={urls.length - offset * 3} damping={0.15}>
        <EffectComposer>
          <Vignette
            offset={0.3}
            darkness={0.8}
            blendFunction={BlendFunction.NORMAL}
          />
        </EffectComposer>

        <Tilt>
          <group rotation={[-0.02, -0.02, 0.11]} ref={bridgeRef}>
            <Scroll>
              {urls.map((item, index) => (
                <Slide
                  url={item}
                  key={index}
                  position-y={(-height + height * offset) * index}
                />
              ))}
            </Scroll>
          </group>
        </Tilt>
        {width / height >= 1 && <Minimap urls={urls} />}
      </ScrollControls>
    </>
  )
}
