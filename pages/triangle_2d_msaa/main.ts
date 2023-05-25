import "../../components/sidebar";
import { ERR_MSG } from "../../libs/constants";
import {
  checkWebGPUSupport,
  getAdapter,
  getCanvasByID,
  getContext,
} from "../../libs/util";

import shader from "./shader.wgsl?raw";

async function init() {
  checkWebGPUSupport();
  const adapter = await getAdapter();
  const device = await adapter.requestDevice();

  const canvas = getCanvasByID("webgpuCanvas");
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  const context = getContext(canvas, {
    device,
    format: presentationFormat,
    alphaMode: "premultiplied",
  });

  /* prettier-ignore */
  // 前半4個が頂点座標(x,y,z,w)、後半4個が色情報(c_x,x_y,c_z,c_w)
  // 合計で3頂点分のデータがある
  const vertices = new Float32Array([
    0.0,  0.6, 0, 1,    1, 0, 0, 1,
   -0.5, -0.6, 0, 1,    0, 1, 0, 1,
    0.5, -0.6, 0, 1,    0, 0, 1, 1,
 ]);
  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    // buffer will be used as a vertex buffer and the destination of copy operations.
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertices, 0, vertices.length);

  // MSAA sample count
  const sampleCount = 4;

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
    multisample: {
      count: sampleCount,
    },
  });

  // MSAA Texture
  const msaaTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    sampleCount,
    format: presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  // commandBuffer
  const commandEncoder = device?.createCommandEncoder();

  const clearColor = { r: 0.0, g: 0.5, b: 1.0, a: 1.0 };
  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        clearValue: clearColor,
        loadOp: "clear",
        storeOp: "discard",
        view: msaaTexture.createView(), // MSAA Texture
        resolveTarget: context.getCurrentTexture().createView(), // Canvas Backbuffer
      },
    ],
  };

  const passEncoder = commandEncoder?.beginRenderPass(renderPassDescriptor);
  passEncoder?.setPipeline(pipeline);
  passEncoder?.setVertexBuffer(0, vertexBuffer);
  passEncoder?.draw(3);
  passEncoder?.end();

  if (!commandEncoder) {
    throw new Error(ERR_MSG.NO_COMMAND_BUFFER);
  }
  device?.queue.submit([commandEncoder.finish()]);
  console.info("Hello, WebGPU!");
}

window.addEventListener("DOMContentLoaded", () => init().catch(alert));
