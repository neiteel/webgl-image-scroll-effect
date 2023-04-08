import { Canvas } from '@react-three/fiber'
import Experience from './Experience'
function App() {
  return (
    <Canvas
      flat
      style={{
        height: '100vh',
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1,
      }}
    >
      <Experience />
    </Canvas>
  )
}

export default App
