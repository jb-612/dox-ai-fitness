import React, { useEffect, useRef } from 'react';
import * as pc from 'playcanvas';
import { UIOverlay } from './UIOverlay';
import { useStore } from '../store';

export const PlayCanvasApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<pc.Application | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    
    // Create the application
    const app = new pc.Application(canvas, {
      mouse: new pc.Mouse(document.body),
      keyboard: new pc.Keyboard(window),
      graphicsDeviceOptions: {
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: false,
        preferWebGl2: true,
      }
    });

    appRef.current = app;

    app.start();
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);

    const onResize = () => {
      if (appRef.current) {
        appRef.current.resizeCanvas();
      }
    };
    window.addEventListener('resize', onResize);

    app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);

    // Load Environment Atlas for PBR reflections
    app.assets.loadFromUrl(
      'https://raw.githubusercontent.com/playcanvas/engine/main/examples/assets/cubemaps/helipad-env-atlas.png',
      'texture',
      (err, asset) => {
        if (!err && asset && asset.resource) {
          app.scene.envAtlas = asset.resource as pc.Texture;
          app.scene.skyboxMip = 2;
          app.scene.exposure = 1.5;
        }
      }
    );

    // Create Camera
    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.8, 0.9, 1.0), // Sky color
      fov: 60,
      nearClip: 0.1,
      farClip: 1000
    });
    
    // High quality rendering on camera
    if (camera.camera) {
      (camera.camera as any).gammaCorrection = pc.GAMMA_SRGB;
      (camera.camera as any).toneMapping = pc.TONEMAP_ACES;
    }
    
    camera.setPosition(0, 1.6, 8);
    app.root.addChild(camera);

    // Camera Controller Script
    const CameraMovement = pc.createScript('cameraMovement') as any;
    CameraMovement.prototype.initialize = function() {
        this.eulers = new pc.Vec3();
        this.speed = 4;
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
        
        // Disable context menu
        this.app.mouse.disableContextMenu();
    };
    CameraMovement.prototype.update = function(dt: number) {
        let force = new pc.Vec3();
        let forward = this.entity.forward;
        let right = this.entity.right;

        // Keyboard movement (WASD / Arrows)
        if (this.app.keyboard.isPressed(pc.KEY_UP) || this.app.keyboard.isPressed(pc.KEY_W)) {
            force.add(forward);
        }
        if (this.app.keyboard.isPressed(pc.KEY_DOWN) || this.app.keyboard.isPressed(pc.KEY_S)) {
            force.sub(forward);
        }
        if (this.app.keyboard.isPressed(pc.KEY_LEFT) || this.app.keyboard.isPressed(pc.KEY_A)) {
            force.sub(right);
        }
        if (this.app.keyboard.isPressed(pc.KEY_RIGHT) || this.app.keyboard.isPressed(pc.KEY_D)) {
            force.add(right);
        }
        if (this.app.keyboard.isPressed(pc.KEY_E)) {
            force.add(pc.Vec3.UP);
        }
        if (this.app.keyboard.isPressed(pc.KEY_Q)) {
            force.sub(pc.Vec3.UP);
        }

        if (force.lengthSq() > 0) {
            force.normalize().mulScalar(this.speed * dt);
            this.entity.translate(force.x, force.y, force.z);
        }
        
        // Keep camera above ground
        const pos = this.entity.getPosition();
        if (pos.y < 0.5) {
            this.entity.setPosition(pos.x, 0.5, pos.z);
        }
    };
    CameraMovement.prototype.onMouseMove = function(e: any) {
        if (this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT) || this.app.mouse.isPressed(pc.MOUSEBUTTON_RIGHT)) {
            this.eulers.x -= e.dy * 0.2;
            this.eulers.y -= e.dx * 0.2;
            
            // Clamp pitch
            this.eulers.x = pc.math.clamp(this.eulers.x, -90, 90);
            
            this.entity.setLocalEulerAngles(this.eulers.x, this.eulers.y, 0);
        }
    };
    CameraMovement.prototype.onMouseWheel = function(e: any) {
        let forward = this.entity.forward;
        let zoomSpeed = 0.5;
        let move = new pc.Vec3().copy(forward).mulScalar(-e.wheelDelta * zoomSpeed);
        this.entity.translate(move.x, move.y, move.z);
    };

    camera.addComponent('script');
    camera.script.create('cameraMovement');

    // Lighting
    // Sunlight from right windows
    const sunLight = new pc.Entity('sunLight');
    sunLight.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1, 0.95, 0.9),
      intensity: 3,
      castShadows: true,
      shadowBias: 0.05,
      normalOffsetBias: 0.05,
      shadowResolution: 2048,
      shadowDistance: 40
    });
    sunLight.setEulerAngles(45, 60, 0);
    app.root.addChild(sunLight);

    // Fill light
    const fillLight = new pc.Entity('fillLight');
    fillLight.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.6, 0.8, 1.0),
      intensity: 0.5,
      castShadows: false
    });
    fillLight.setEulerAngles(45, -120, 0);
    app.root.addChild(fillLight);

    // Materials
    const createMat = (diffuse: number[], gloss: number, metalness: number, opacity: number = 1) => {
      const mat = new pc.StandardMaterial();
      mat.diffuse = new pc.Color(diffuse[0], diffuse[1], diffuse[2]);
      mat.gloss = gloss;
      mat.metalness = metalness;
      mat.useMetalness = true;
      if (opacity < 1) {
        mat.opacity = opacity;
        mat.blendType = pc.BLEND_NORMAL;
      }
      mat.update();
      return mat;
    };

    const smoothFloorMat = createMat([0.1, 0.1, 0.1], 0.9, 0.2);
    const rubberFloorMat = createMat([0.05, 0.05, 0.05], 0.2, 0.0);
    const ceilingMat = createMat([0.2, 0.2, 0.2], 0.3, 0.0);
    const wallMat = createMat([0.9, 0.9, 0.9], 0.4, 0.0);
    const glassMat = createMat([0.6, 0.8, 1.0], 1.0, 0.9, 0.3);
    const ductMat = createMat([0.8, 0.8, 0.8], 0.7, 0.8);
    const frameMat = createMat([0.05, 0.05, 0.05], 0.5, 0.8);
    const equipmentMat = createMat([0.1, 0.1, 0.1], 0.6, 0.8);
    const padMat = createMat([0.05, 0.05, 0.05], 0.4, 0.1);
    const chromeMat = createMat([0.9, 0.9, 0.9], 0.9, 1.0);
    const yellowMat = createMat([0.9, 0.8, 0.1], 0.5, 0.1);

    // Helpers
    const createEntity = (name: string, type: string, pos: number[], scale: number[], mat: pc.StandardMaterial, rot: number[] = [0,0,0]) => {
      const entity = new pc.Entity(name);
      entity.addComponent('render', { type: type, material: mat, castShadows: true, receiveShadows: true });
      entity.setPosition(pos[0], pos[1], pos[2]);
      entity.setLocalScale(scale[0], scale[1], scale[2]);
      entity.setEulerAngles(rot[0], rot[1], rot[2]);
      app.root.addChild(entity);
      return entity;
    };

    // --- Architecture ---
    
    // Floors
    createEntity('floorSmooth', 'box', [-5, -0.05, 0], [10, 0.1, 40], smoothFloorMat);
    createEntity('floorRubber', 'box', [5, -0.05, 0], [10, 0.1, 40], rubberFloorMat);

    // Ceiling
    createEntity('ceiling', 'box', [0, 6, 0], [20, 0.1, 40], ceilingMat);

    // Left Wall (Solid)
    createEntity('leftWall', 'box', [-10, 3, 0], [0.5, 6, 40], wallMat);
    createEntity('pillar', 'cylinder', [-8, 3, -5], [1.5, 6, 1.5], wallMat);

    // Right Wall (Glass)
    createEntity('rightWall', 'box', [10, 3, 0], [0.1, 6, 40], glassMat);
    createEntity('rightFrameB', 'box', [10, 0.1, 0], [0.3, 0.2, 40], frameMat);
    createEntity('rightFrameT', 'box', [10, 5.9, 0], [0.3, 0.2, 40], frameMat);
    for (let i = 0; i < 10; i++) {
      createEntity(`rightFrameV_${i}`, 'box', [10, 3, -18 + i * 4], [0.3, 6, 0.2], frameMat);
    }

    // Back Wall (Glass)
    createEntity('backWall', 'box', [0, 3, -20], [20, 6, 0.1], glassMat);
    createEntity('backFrameB', 'box', [0, 0.1, -20], [20, 0.2, 0.3], frameMat);
    createEntity('backFrameT', 'box', [0, 5.9, -20], [20, 0.2, 0.3], frameMat);
    for (let i = 0; i < 6; i++) {
      createEntity(`backFrameV_${i}`, 'box', [-10 + i * 4, 3, -20], [0.2, 6, 0.3], frameMat);
    }

    // Ceiling Ducts
    for (let i = 0; i < 5; i++) {
      createEntity(`duct_${i}`, 'cylinder', [-8 + i * 4, 5.5, 0], [0.8, 40, 0.8], ductMat, [90, 0, 0]);
      
      // Linear Lights
      const lightBox = createEntity(`lightBox_${i}`, 'box', [-6 + i * 4, 5.8, 0], [0.2, 0.1, 38], createMat([2, 2, 2], 0, 0));
      const pLight = new pc.Entity();
      pLight.addComponent('light', {
        type: 'point',
        color: new pc.Color(1, 1, 1),
        intensity: 0.5,
        range: 10
      });
      pLight.setPosition(-6 + i * 4, 5.5, 0);
      app.root.addChild(pLight);
    }

    // --- Equipment ---

    // Cable Machine (Left)
    createEntity('cableBase', 'box', [-6, 1.25, -2], [2, 2.5, 1.5], equipmentMat);
    createEntity('cableInner', 'box', [-6, 1.1, -2], [0.8, 2.2, 1], frameMat);
    createEntity('cableYellow', 'box', [-4.95, 1.5, -2], [0.1, 0.4, 0.1], yellowMat);

    // Squat Rack (Right Foreground)
    const rackX = 7;
    const rackZ = 5;
    createEntity('rackFL', 'box', [rackX - 0.6, 1.25, rackZ - 0.6], [0.1, 2.5, 0.1], equipmentMat);
    createEntity('rackFR', 'box', [rackX + 0.6, 1.25, rackZ - 0.6], [0.1, 2.5, 0.1], equipmentMat);
    createEntity('rackBL', 'box', [rackX - 0.6, 1.25, rackZ + 0.6], [0.1, 2.5, 0.1], equipmentMat);
    createEntity('rackBR', 'box', [rackX + 0.6, 1.25, rackZ + 0.6], [0.1, 2.5, 0.1], equipmentMat);
    createEntity('rackTopF', 'box', [rackX, 2.45, rackZ - 0.6], [1.3, 0.1, 0.1], equipmentMat);
    createEntity('rackTopB', 'box', [rackX, 2.45, rackZ + 0.6], [1.3, 0.1, 0.1], equipmentMat);
    createEntity('rackTopL', 'box', [rackX - 0.6, 2.45, rackZ], [0.1, 0.1, 1.3], equipmentMat);
    createEntity('rackTopR', 'box', [rackX + 0.6, 2.45, rackZ], [0.1, 0.1, 1.3], equipmentMat);
    // Barbell
    createEntity('barbell', 'cylinder', [rackX, 1.5, rackZ + 0.65], [0.04, 2.2, 0.04], chromeMat, [0, 0, 90]);
    createEntity('plateL', 'cylinder', [rackX - 0.9, 1.5, rackZ + 0.65], [0.4, 0.08, 0.4], frameMat, [0, 0, 90]);
    createEntity('plateR', 'cylinder', [rackX + 0.9, 1.5, rackZ + 0.65], [0.4, 0.08, 0.4], frameMat, [0, 0, 90]);

    // Adjustable Benches
    [0, 4, 8].map((zOffset, i) => {
      const bx = 4;
      const bz = zOffset - 2;
      createEntity(`benchBase_${i}`, 'box', [bx, 0.15, bz], [0.4, 0.3, 1.2], equipmentMat, [0, 15, 0]);
      createEntity(`benchSeat_${i}`, 'box', [bx, 0.35, bz + 0.3], [0.4, 0.1, 0.6], padMat, [0, 15, 0]);
      createEntity(`benchBack_${i}`, 'box', [bx, 0.7, bz - 0.2], [0.4, 0.8, 0.1], padMat, [30, 15, 0]);
    });

    // Dumbbell Rack
    createEntity('dbRack', 'box', [9, 0.6, -2], [0.6, 1.2, 10], equipmentMat);
    for (let i = 0; i < 12; i++) {
      const z = -6.5 + i * 0.8;
      createEntity(`dbHandle_${i}`, 'cylinder', [9, 1.25, z], [0.04, 0.3, 0.04], chromeMat, [0, 0, 90]);
      createEntity(`dbWeightL_${i}`, 'cylinder', [8.85, 1.25, z], [0.2, 0.1, 0.2], frameMat, [0, 0, 90]);
      createEntity(`dbWeightR_${i}`, 'cylinder', [9.15, 1.25, z], [0.2, 0.1, 0.2], frameMat, [0, 0, 90]);
    }

    // Punching Bag Rig
    createEntity('bagPoleL', 'box', [5, 1.5, -10], [0.15, 3, 0.15], equipmentMat);
    createEntity('bagPoleR', 'box', [7, 1.5, -10], [0.15, 3, 0.15], equipmentMat);
    createEntity('bagTop', 'box', [6, 3, -10], [2.15, 0.15, 0.15], equipmentMat);
    createEntity('bag', 'cylinder', [6, 1.5, -10], [0.6, 1.2, 0.6], padMat);
    createEntity('bagChain', 'cylinder', [6, 2.55, -10], [0.04, 0.9, 0.04], chromeMat);

    // Cardio Equipment
    [0, 1.5, 3].map((xOffset, i) => {
      const cx = -2 + xOffset;
      const cz = -14;
      createEntity(`cardioBase_${i}`, 'box', [cx, 0.1, cz], [0.6, 0.2, 1.8], equipmentMat);
      createEntity(`cardioFront_${i}`, 'box', [cx, 0.7, cz - 0.7], [0.4, 1.2, 0.4], frameMat);
      createEntity(`cardioScreen_${i}`, 'box', [cx, 1.4, cz - 0.6], [0.5, 0.4, 0.1], createMat([0,0,0], 0.9, 0.5), [-30, 0, 0]);
    });

    // Mark as loaded
    useStore.getState().setLoaded(true);

    return () => {
      window.removeEventListener('resize', onResize);
      app.destroy();
      appRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-screen w-full bg-zinc-900 overflow-hidden">
      <UIOverlay />
      <canvas ref={canvasRef} className="w-full h-full block outline-none" tabIndex={0} />
    </div>
  );
};
