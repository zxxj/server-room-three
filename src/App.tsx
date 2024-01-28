import React from 'react';
import './App.css';
import ServerRoom from './components/ServerRoom';

// 服务器机房对象
let room: ServerRoom;

// canvas画布
let canvas: HTMLCanvasElement | null;

class App extends React.Component {
  componentDidMount(): void {
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    room = new ServerRoom(canvas);
    room.loadGLTF('machineRoom.gltf', './models/');
    room.animate();
  }
  render() {
    return (
      <div className='App'>
        <canvas id='container' ref={(el) => (canvas = el)}></canvas>
      </div>
    );
  }
}

export default App;
