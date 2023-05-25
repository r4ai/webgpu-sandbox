import { ERR_MSG } from "../libs/constants";

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

export function isWebGPUSupported() {
  return navigator.gpu ? true : false;
}

export function checkWebGPUSupport() {
  if (!isWebGPUSupported()) {
    throw new Error(ERR_MSG.WEBGPU_NOT_SUPPORTED);
  }
}

export function getCanvasByID(id: string) {
  const canvas = document.getElementById(id) as HTMLCanvasElement | null;
  if (!canvas) {
    throw new Error(ERR_MSG.NO_CANVAS);
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
    throw new Error(ERR_MSG.WEBGPU_NOT_SUPPORTED);
  }
  context.configure(config);
  return context;
}

export async function getAdapter() {
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error(ERR_MSG.NO_GPU);
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
