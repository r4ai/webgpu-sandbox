import "../../components/sidebar";

import { mat4, vec3 } from "wgpu-matrix";
import {
  cubeVertexArray,
  cubeVertexSize,
  cubeUVOffset,
  cubePositionOffset,
  cubeVertexCount,
} from "./cube";
import shader from "./shader.wgsl?raw";
import {
  checkWebGPUSupport,
  getAdapter,
  getCanvasByID,
  getContext,
} from "../../libs/util";

async function init() {
  // get adapter(物理デバイス) and device(論理デバイス)
  checkWebGPUSupport();
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
              // uv
              shaderLocation: 1,
              offset: cubeUVOffset,
              format: "float32x2",
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
  const uniformBufferSize = 4 * 16; // 4x4 matrix
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

  function frame() {
    // 座標返還行列を更新
    const transformationMatrix = getTransformationMatrix(aspect);
    device?.queue.writeBuffer(
      uniformBuffer,
      0,
      transformationMatrix.buffer,
      transformationMatrix.byteOffset,
      transformationMatrix.byteLength
    );

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
    passEncoder.draw(cubeVertexCount, 1, 0, 0);
    passEncoder.end();
    device?.queue.submit([commandEncoder.finish()]);

    // 次のフレームをリクエスト
    requestAnimationFrame(frame);
  }
  frame();
}

function getTransformationMatrix(aspect: number) {
  const now = Date.now() / 1000;
  const projectionMatrix = mat4.perspective(Math.PI / 4, aspect, 1, 100.0);
  let modelViewProjectionMatrix = mat4.create();
  let viewMatrix = mat4.identity();

  viewMatrix = mat4.translate(viewMatrix, vec3.fromValues(0, 0, -20));
  viewMatrix = mat4.rotateX(viewMatrix, now);
  viewMatrix = mat4.rotateY(viewMatrix, now);

  modelViewProjectionMatrix = mat4.multiply(projectionMatrix, viewMatrix);
  return modelViewProjectionMatrix as Float32Array;
}

window.addEventListener("DOMContentLoaded", () => init().catch(alert));
