import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// GLTF模型加载器
const loader = new GLTFLoader();

export default class ServerRoom {
  // 场景
  scene: Scene;

  // 相机
  camera: PerspectiveCamera;

  // 渲染器
  renderer: WebGLRenderer;

  // 轨道控制器
  controls: OrbitControls;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      45,
      canvas.width / canvas.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  // 加载GLTF模型
  loadGLTF(modelName: string, modelPath: string) {
    loader.load(modelPath + modelName, (gltf) => {
      this.scene.add(gltf.scene);
    });
  }

  // 循环动画帧
  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
    this.adaption();
  }

  // 自适应宽高比
  adaption() {
    window.onresize = () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    };
  }
}
