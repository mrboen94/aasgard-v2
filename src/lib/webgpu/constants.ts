export const GPU_BUFFER_USAGE = {
  COPY_DST: 8,
  STORAGE: 128,
  UNIFORM: 64
} as const;

export const GPU_TEXTURE_USAGE = {
  COPY_DST: 2,
  RENDER_ATTACHMENT: 16,
  TEXTURE_BINDING: 4
} as const;
