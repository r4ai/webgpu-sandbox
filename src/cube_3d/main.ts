import shader from "./shader.wgsl?raw";
import { vertices, indices } from "./cube";
import { mat4, vec3 } from "wgpu-matrix";

async function init() {
  const canvas = document.getElementById("webgpuCanvas") as HTMLCanvasElement;
  const context = canvas?.getContext("webgpu") as GPUCanvasContext;

  if (!context) {
    alert("Please use Google Chrome. Your browser does not support WebGPU.");
    return new Error("Failed to get WebGPU context");
  } else {
    console.info("Start initializing WebGPU...");
  }

  // get device
  const adapter = await navigator.gpu.requestAdapter(); // 物理
  const device = await adapter?.requestDevice(); // 論理

  if (!device || !adapter) {
    return new Error("Failed to get GPU device");
  }

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device: device,
    format: presentationFormat,
    // opaque: 背景透過なし
    // premultiplied: 背景透過あり
    alphaMode: "premultiplied",
  });

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

  // Matrix
  const aspect = canvas.width / canvas.height;
  const fov = (2 * Math.PI) / 5;
  const projectionMatrix = mat4.perspective(fov, aspect, 1, 100.0);

  const modelViewProjectionMatrix = mat4.create();
  const viewMatrix = mat4.identity();
  mat4.translate(viewMatrix, vec3.fromValues(0, 0, -4), viewMatrix);
  mat4.rotate(
    viewMatrix,
    vec3.fromValues(Math.PI / 4, Math.PI / 4, 0),
    1,
    viewMatrix
  );
  mat4.multiply(projectionMatrix, viewMatrix, modelViewProjectionMatrix);

  // Uniform Buffer
  const uniformBuffer = device.createBuffer({
    size: 4 * 16, // 4x4 matrix
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
  passEncoder?.setBindGroup(0, uniformBindGroup);
  passEncoder?.drawIndexed(indices.length);
  passEncoder?.end();

  if (!commandEncoder) {
    return new Error("Failed to create command encoder");
  }
  device?.queue.submit([commandEncoder.finish()]);
  console.info("Hello, WebGPU!");
}

window.addEventListener("DOMContentLoaded", init);
