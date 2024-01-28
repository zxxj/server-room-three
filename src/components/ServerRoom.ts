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
  Raycaster,
  Vector2,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// GLTF模型加载器
const loader = new GLTFLoader();

//射线投射器，可基于鼠标点和相机，在世界坐标系内建立一条射线，用于选中模型
const raycaster = new Raycaster();

//鼠标在裁剪空间中的点位
const pointer = new Vector2();

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

  //机柜集合
  cabinets: Mesh[] = [];

  //鼠标划入的机柜
  curCabinet: any;

  //鼠标划入机柜事件，参数为机柜对象
  onMouseOverCabinet = (cabinet: Mesh) => {};

  //鼠标在机柜上移动的事件，参数为鼠标在canvas画布上的坐标位
  onMouseMoveCabinet = (x: number, y: number) => {};

  //鼠标划出机柜的事件
  onMouseOutCabinet = () => {};

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

    this.createTexture('cabinet-hover.jpg'); // 向纹理集合中添加一个表示机柜高亮的贴图, 为之后选中做铺垫
  }

  // 加载GLTF模型
  loadGLTF(modelName: string, modelPath: string) {
    loader.load(modelPath + modelName, (gltf) => {
      gltf.scene.children.forEach((mesh: Mesh) => {
        const { map, color } = mesh.material as MeshStandardMaterial;
        this.changeMeshMaterial(mesh, map, color);

        // 判断如果是机柜,则添加到数组中
        if (mesh.name.includes('cabinet')) {
          this.cabinets.push(mesh);
        }
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

  selectCabinet(x: number, y: number) {
    const { cabinets, renderer, camera, maps, curCabinet } = this;
    const { width, height } = renderer.domElement;

    // 鼠标的canvas坐标转裁剪坐标
    pointer.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
    // 基于鼠标点的裁剪坐标位和相机设置射线投射器
    raycaster.setFromCamera(pointer, camera);
    // 选择机柜
    const intersect = raycaster.intersectObjects(cabinets)[0];
    const intersectObj = intersect ? (intersect.object as Mesh) : null;
    // 若之前已有机柜被选择，且不等于当前所选择的机柜，取消之前选择的机柜的高亮
    if (curCabinet && curCabinet !== intersectObj) {
      const material = curCabinet.material as MeshBasicMaterial;
      material.setValues({
        map: maps.get('cabinet.jpg'),
      });
    }
    /* 
      若当前所选对象不为空：
        触发鼠标在机柜上移动的事件。
        若当前所选对象不等于上一次所选对象：
          更新curCabinet。
          将模型高亮。
          触发鼠标划入机柜事件。
      否则若上一次所选对象存在：
        置空curCabinet。
        触发鼠标划出机柜事件。
    */
    if (intersectObj) {
      this.onMouseMoveCabinet();
      if (intersectObj !== curCabinet) {
        this.curCabinet = intersectObj;
        const material = intersectObj.material as MeshBasicMaterial;
        material.setValues({
          map: maps.get('cabinet-hover.jpg'),
        });
        this.onMouseOverCabinet();
      }
    } else if (curCabinet) {
      this.curCabinet = null;
      this.onMouseOutCabinet();
    }
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
