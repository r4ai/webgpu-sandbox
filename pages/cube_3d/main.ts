import "../../components/sidebar.js";

import {
  cubeVertexArray,
  cubeVertexSize,
  cubePositionOffset,
  cubeColorOffset,
  cubeIndicesArray,
} from "./cube";

import shader from "./shader.wgsl?raw";
import { getAdapter, getCanvasByID, getContext, handle_error } from "../util";

async function init() {
  // get adapter(物理デバイス) and device(論理デバイス)
  const adapter = await getAdapter();
  const device = await adapter.requestDevice();
  console.log("Start initializing WebGPU...");

  // get context
  const canvas = getCanvasByID("webgpuCanvas");
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  const context = getContext(canvas, {
    device,
    format: presentationFormat,
    alphaMode: "premultiplied",
  });

  // Create a vertex buffer from the cube data.
  const verticesBuffer = device.createBuffer({
    size: cubeVertexArray.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(verticesBuffer.getMappedRange()).set(cubeVertexArray);
  verticesBuffer.unmap();

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "vertex_main",
      buffers: [
        {
          arrayStride: cubeVertexSize,
          stepMode: "vertex",
          attributes: [
            {
              // position
              shaderLocation: 0,
              offset: cubePositionOffset,
              format: "float32x4",
            },
            {
              // color
              shaderLocation: 1,
              offset: cubeColorOffset,
              format: "float32x4",
            },
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "fragment_main",
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",

      // Backface culling since the cube is solid piece of geometry.
      // Faces pointing away from the camera will be occluded by faces
      // pointing toward the camera.
      cullMode: "back",
    },

    // Enable depth testing so that the fragment closest to the camera
    // is rendered in front.
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth24plus",
    },
  });

  const depthTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  // Uniform buffer (変換行列を保存)
  const uniformBufferSize = 4 * 4; // u32
  const uniformBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  const uniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
        },
      },
    ],
  });

  // Index buffer
  const indicesBuffer = device.createBuffer({
    size: cubeIndicesArray.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(
    indicesBuffer,
    0,
    cubeIndicesArray,
    0,
    cubeIndicesArray.length
  );

  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
        view: context.getCurrentTexture().createView(),
      },
    ],
    depthStencilAttachment: {
      view: depthTexture.createView(),
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  };

  const aspect = canvas.width / canvas.height;
  let frameInfo = new Float32Array([0.8, 0.8, 0, 0]);

  function frame() {
    const time = Date.now();
    frameInfo[0] = Math.sin(time / 1000);
    frameInfo[1] = Math.cos(time / 1000);
    frameInfo[2] = aspect;

    // 座標返還行列を更新
    device?.queue.writeBuffer(uniformBuffer, 0, frameInfo, 0, frameInfo.length);

    // 画面を更新する
    /* @ts-ignore */
    renderPassDescriptor.colorAttachments[0].view = context
      .getCurrentTexture()
      .createView();

    // GPUにコマンドを送信
    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, uniformBindGroup);
    passEncoder.setVertexBuffer(0, verticesBuffer);
    passEncoder.setIndexBuffer(indicesBuffer, "uint16");
    passEncoder.drawIndexed(cubeIndicesArray.length);
    passEncoder.end();
    device?.queue.submit([commandEncoder.finish()]);

    // 次のフレームをリクエスト
    requestAnimationFrame(frame);
  }
  frame();
}

window.addEventListener("DOMContentLoaded", () => handle_error(init));
