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

    // Create Camera
    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
      clearColor: new pc.Color(0.1, 0.1, 0.1),
      fov: 60,
      nearClip: 0.1,
      farClip: 1000
    });
    
    // High quality rendering on camera
    if (camera.camera) {
      (camera.camera as any).gammaCorrection = pc.GAMMA_SRGB;
      (camera.camera as any).toneMapping = pc.TONEMAP_ACES;
    }
    
    camera.setPosition(0, 2, 8);
    app.root.addChild(camera);

    // Camera Controller Script
    const CameraMovement = pc.createScript('cameraMovement') as any;
    CameraMovement.prototype.initialize = function() {
        this.eulers = new pc.Vec3();
        this.speed = 5;
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
    };
    CameraMovement.prototype.update = function(dt: number) {
        let force = new pc.Vec3();
        let forward = this.entity.forward;
        let right = this.entity.right;
        let up = this.entity.up;

        // Keyboard movement
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
    };
    CameraMovement.prototype.onMouseMove = function(e: any) {
        if (this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT) || this.app.mouse.isPressed(pc.MOUSEBUTTON_RIGHT)) {
            this.eulers.x -= e.dy * 0.2;
            this.eulers.y -= e.dx * 0.2;
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
    const dirLight = new pc.Entity('dirLight');
    dirLight.addComponent('light', {
      type: 'directional',
      color: new pc.Color(1, 1, 1),
      intensity: 2,
      castShadows: true,
      shadowBias: 0.05,
      normalOffsetBias: 0.05,
      shadowResolution: 2048
    });
    dirLight.setEulerAngles(45, 45, 0);
    app.root.addChild(dirLight);

    // Materials
    const floorMat = new pc.StandardMaterial();
    floorMat.diffuse = new pc.Color(0.1, 0.1, 0.1);
    floorMat.gloss = 0.8;
    floorMat.metalness = 0.2;
    floorMat.useMetalness = true;
    floorMat.update();

    const wallMat = new pc.StandardMaterial();
    wallMat.diffuse = new pc.Color(0.2, 0.2, 0.2);
    wallMat.gloss = 0.5;
    wallMat.update();

    const glassMat = new pc.StandardMaterial();
    glassMat.diffuse = new pc.Color(0.5, 0.8, 1.0);
    glassMat.opacity = 0.3;
    glassMat.blendType = pc.BLEND_NORMAL;
    glassMat.gloss = 0.9;
    glassMat.metalness = 0.8;
    glassMat.useMetalness = true;
    glassMat.update();

    // Room Construction
    const createBox = (name: string, pos: number[], scale: number[], mat: pc.StandardMaterial) => {
      const box = new pc.Entity(name);
      box.addComponent('render', { type: 'box', material: mat });
      box.setPosition(pos[0], pos[1], pos[2]);
      box.setLocalScale(scale[0], scale[1], scale[2]);
      app.root.addChild(box);
      return box;
    };

    // Enclosed Room
    createBox('floor', [0, -0.05, 0], [30, 0.1, 30], floorMat);
    createBox('ceiling', [0, 8, 0], [30, 0.1, 30], wallMat);
    createBox('leftWall', [-15, 4, 0], [0.5, 8, 30], wallMat);
    createBox('rightWall', [15, 4, 0], [0.5, 8, 30], glassMat);
    createBox('backWall', [0, 4, -15], [30, 8, 0.5], wallMat);
    createBox('frontWall', [0, 4, 15], [30, 8, 0.5], wallMat);

    // Gym Props
    const propMat = new pc.StandardMaterial();
    propMat.diffuse = new pc.Color(0.15, 0.15, 0.15);
    propMat.gloss = 0.6;
    propMat.update();

    const mirrorMat = new pc.StandardMaterial();
    mirrorMat.diffuse = new pc.Color(0.8, 0.9, 1.0);
    mirrorMat.metalness = 1.0;
    mirrorMat.useMetalness = true;
    mirrorMat.gloss = 1.0;
    mirrorMat.update();

    createBox('bench1', [-4, 0.2, -4], [0.6, 0.4, 1.5], propMat);
    createBox('bench2', [4, 0.2, -2], [0.6, 0.4, 1.5], propMat);
    createBox('rack', [8, 0.6, -8], [4, 1.2, 0.6], propMat);
    
    // Mirror on the back wall
    createBox('mirror', [0, 3, -14.7], [16, 4, 0.1], mirrorMat);

    // Some dumbbells
    for (let i = 0; i < 5; i++) {
      createBox(`db_${i}`, [6.5 + i * 0.8, 1.3, -8], [0.2, 0.2, 0.4], propMat);
    }

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
