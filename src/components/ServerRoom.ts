import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Texture,
  Mesh,
  Color,
  MeshBasicMaterial,
  TextureLoader,
  MeshStandardMaterial,
  DoubleSide,
} from 'three';
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

  // 修改模型的材质和图像源(为了解决纹理贴图颜色差异问题)
  maps: Map<string, Texture> = new Map(); // 用来存储纹理对象,以避免纹理贴图的重复加载

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
      gltf.scene.children.forEach((mesh: Mesh) => {
        const { map, color } = mesh.material as MeshStandardMaterial;
        this.changeMeshMaterial(mesh, map, color);
      });
      this.scene.add(gltf.scene);
    });
  }

  // 修改模型中所有Mesh对象的材质
  changeMeshMaterial(obj: Mesh, map: Texture, color: Color) {
    if (map) {
      obj.material = new MeshBasicMaterial({
        map: this.createTexture(map.name),
        side: DoubleSide,
      });
    } else {
      obj.material = new MeshBasicMaterial({ color: color });
    }
  }

  // 创建纹理对象
  createTexture(imgName: string) {
    let texture = this.maps.get(imgName);

    if (!texture) {
      texture = new TextureLoader().load('./models/' + imgName);
      texture.wrapS = 1000;
      texture.wrapT = 1000;
      texture.flipY = false;

      this.maps.set(imgName, texture);
    }

    return texture;
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
