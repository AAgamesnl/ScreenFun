(() => {
  const canvas = document.getElementById('playerCanvas');
  if (!canvas) return;
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.ArcRotateCamera('cam', -Math.PI / 2, Math.PI / 2.5, 4, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 0), scene);
  const box = BABYLON.MeshBuilder.CreateBox('box', {}, scene);

  engine.runRenderLoop(() => {
    box.rotation.y += 0.01;
    scene.render();
  });

  window.addEventListener('resize', () => engine.resize());
})();
