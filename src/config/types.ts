import { z } from 'zod';

export const ServiceConfigSchema = z.object({
  allowedResources: z.array(z.string()).optional(),
});

export const TransformContextSchema = z.object({
  namespace: z.string(),
  service: z.string().optional(),
  image: z.string().optional(),
  environment: z.string().optional(),
});

export const KecConfigSchema = z.object({
  templateSource: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('namespace'),
      namespace: z.string(),
    }),
    z.object({
      type: z.literal('file'),
      dir: z.string(),
    }),
  ]),
  protectedNamespaces: z.array(z.string()).optional(),
  protectedEnvironments: z.array(z.string()).optional(),
  services: z.record(z.string(), ServiceConfigSchema).optional(),
  transforms: z
    .record(
      z.string(),
      z.function({ input: [z.unknown(), z.unknown()], output: z.unknown() }),
    )
    .optional(),
});

export type KecConfig = z.infer<typeof KecConfigSchema>;
export type ServiceConfig = z.infer<typeof ServiceConfigSchema>;
export type TransformContext = z.infer<typeof TransformContextSchema>;
export type TransformFn = (resource: unknown, ctx: TransformContext) => unknown | Promise<unknown>;
