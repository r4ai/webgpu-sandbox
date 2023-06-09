import "../../components/sidebar";
import { ERR_MSG } from "../../libs/constants";

import shader from "./shader.wgsl?raw";

async function init() {
  const canvas = document.getElementById("webgpuCanvas") as HTMLCanvasElement;
  const context = canvas?.getContext("webgpu");

  if (!context) {
    throw new Error(ERR_MSG.WEBGPU_NOT_SUPPORTED);
  } else {
    console.info("Start initializing WebGPU...");
  }

  // get device
  const adapter = await navigator.gpu.requestAdapter(); // 物理
  const device = await adapter?.requestDevice(); // 論理

  if (!device || !adapter) {
    throw new Error(ERR_MSG.NO_GPU);
  }

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device: device,
    format: presentationFormat,
    // opaque: 背景透過なし
    // premultiplied: 背景透過あり
    alphaMode: "premultiplied",
  });

  /* prettier-ignore */
  // 前半4個が頂点座標(x,y,z,w)、後半4個が色情報(c_x,x_y,c_z,c_w)
  // 合計で3頂点分のデータがある
  const vertices = new Float32Array([
    // 左上の三角形
    -0.8, -0.8, 0, 1,    1, 0, 0, 1,  // 左下
    -0.8, 0.8, 0, 1,     1, 1, 0, 1,  // 左上
    0.8, 0.8, 0, 1,      0, 1, 1, 1,  // 右上
    0.8, -0.8, 0, 1,     0, 0, 1, 1,  // 右下
 ]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    // buffer will be used as a vertex buffer and the destination of copy operations.
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  const indicesBuffer = device.createBuffer({
    size: indices.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(vertexBuffer, 0, vertices, 0, vertices.length);
  device.queue.writeBuffer(indicesBuffer, 0, indices, 0, indices.length);

  // create a render pipeline
  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "vertexShader",
      buffers: [
        {
          attributes: [
            {
              shaderLocation: 0, // position
              offset: 0,
              format: "float32x4",
            },
            {
              shaderLocation: 1, // color
              offset: 4 * 4,
              format: "float32x4",
            },
          ],
          // 各頂点を構成するデータのサイズ [bytes]
          // 頂点座標(x,y,z,w) + 色情報(c_x,x_y,c_z,c_w) = 4 * 4 + 4 * 4 = 32 bytes
          arrayStride: 32,
          stepMode: "vertex",
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "fragmentShader",
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  // commandBuffer
  const commandEncoder = device?.createCommandEncoder();

  const textureView = context.getCurrentTexture().createView();
  const clearColor = { r: 0.0, g: 0.5, b: 1.0, a: 1.0 };
  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        clearValue: clearColor,
        loadOp: "clear",
        storeOp: "store",
        view: textureView,
      },
    ],
  };

  const passEncoder = commandEncoder?.beginRenderPass(renderPassDescriptor);
  passEncoder?.setPipeline(pipeline);
  passEncoder?.setVertexBuffer(0, vertexBuffer);
  passEncoder?.setIndexBuffer(indicesBuffer, "uint16");
  passEncoder?.drawIndexed(indices.length);
  passEncoder?.end();

  if (!commandEncoder) {
    throw new Error(ERR_MSG.NO_COMMAND_BUFFER);
  }
  device?.queue.submit([commandEncoder.finish()]);
  console.info("Hello, WebGPU!");
}

window.addEventListener("DOMContentLoaded", () => init().catch(alert));
