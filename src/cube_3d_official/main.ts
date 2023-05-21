import { mat4, vec3, vec4 } from "wgpu-matrix";

import {
  cubeVertexArray,
  cubeVertexSize,
  cubeUVOffset,
  cubePositionOffset,
  cubeVertexCount,
} from "./cube";

import shader from "./shader.wgsl?raw";
import { handle_error } from "../util";

async function init() {
  // get context
  const canvas = document.getElementById("webgpuCanvas") as HTMLCanvasElement;
  const context = canvas?.getContext("webgpu") as GPUCanvasContext;
  if (!context) {
    throw new Error(
      "Please use Google Chrome. Your browser does not support WebGPU."
    );
  }
  console.log("Start initializing WebGPU...");

  // get adapter(物理デバイス) and device(論理デバイス)
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!adapter || !device) {
    throw new Error("Failed to get GPU device");
  }

  // configure context
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
    alphaMode: "premultiplied", // 背景透過あり
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
    // Sample is no longer the active page.
    const transformationMatrix = getTransformationMatrix(aspect);
    device?.queue.writeBuffer(
      uniformBuffer,
      0,
      transformationMatrix.buffer,
      transformationMatrix.byteOffset,
      transformationMatrix.byteLength
    );
    /* @ts-ignore */
    renderPassDescriptor.colorAttachments[0].view = context
      .getCurrentTexture()
      .createView();

    const commandEncoder = device?.createCommandEncoder();
    if (!commandEncoder) return 1;
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, uniformBindGroup);
    passEncoder.setVertexBuffer(0, verticesBuffer);
    passEncoder.draw(cubeVertexCount, 1, 0, 0);
    passEncoder.end();
    device?.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function debug(mat4: Float32Array) {
  let msg = "";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      msg += mat4[i * 4 + j] + " ";
    }
    msg += "\n";
  }
  console.log(msg);
}

function getTransformationMatrix(aspect: number) {
  let modelViewProjectionMatrix = mat4.create();

  const projectionMatrix = mat4.perspective(Math.PI / 4, aspect, 1, 100.0);
  debug(projectionMatrix);
  const viewMatrix = mat4.identity();
  mat4.translate(viewMatrix, vec3.fromValues(0, 0, -20), viewMatrix);
  // alert(1);
  const now = Date.now() / 1000;
  mat4.rotateX(viewMatrix, now, viewMatrix);
  mat4.rotateY(viewMatrix, now, viewMatrix);
  mat4.multiply(projectionMatrix, viewMatrix, modelViewProjectionMatrix);
  const tmp = vec4;
  debug(modelViewProjectionMatrix);
  alert();
  return modelViewProjectionMatrix as Float32Array;
}

window.addEventListener("DOMContentLoaded", () => handle_error(init));
