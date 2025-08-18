// Babylon.js UMD build placeholder - replace with actual Babylon.js from https://cdn.babylonjs.com/babylon.js
window.BABYLON = {
  Engine: class { constructor() {} },
  Scene: class { constructor() {} },
  ArcRotateCamera: class { constructor() {} },
  Vector3: class { static Zero() { return {x:0,y:0,z:0}; } },
  HemisphericLight: class { constructor() {} },
  MeshBuilder: class { static CreateBox() { return {}; } }
};
