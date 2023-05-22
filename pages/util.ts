export function handle_error(init: Function) {
  try {
    init();
  } catch (error) {
    alert(error);
  }
}

export function debug(mat4: Float32Array | ArrayLike<number>) {
  let msg = "";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      msg += mat4[i * 4 + j] + " ";
    }
    msg += "\n";
  }
  console.log(msg);
}

export function getCanvasByID(id: string) {
  const canvas = document.getElementById(id) as HTMLCanvasElement | null;
  if (!canvas) {
    throw new Error(`No canvas with id: ${id}`);
  }
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  return canvas;
}

export function getContext(
  canvas: HTMLCanvasElement,
  config: GPUCanvasConfiguration
) {
  const context = canvas?.getContext("webgpu");
  if (!context) {
    throw new Error(
      "Please use Google Chrome or Edge. Your browser does not support WebGPU."
    );
  }
  context.configure(config);
  return context;
}

export async function getAdapter() {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("No GPU found.");
  }
  return adapter;
}

export async function getTexture(path: string) {
  const img = document.createElement("img");
  img.crossOrigin = "Anonymous";
  img.src = path;
  await img.decode();
  const imageBitmap = await createImageBitmap(img);
  return imageBitmap;
}
