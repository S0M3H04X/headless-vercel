import { z } from 'zod';

// 定義 ContentDescriptor 的驗證規則
const ContentDescriptorSchema = z.object({
  kind: z.string(), // 允許字串，讓 Registry 決定是否為 Unknown
  sourceId: z.string(),
  initialMeta: z.record(z.unknown()).optional(),
});

// 定義 WindowInstance 的驗證規則 (只驗證持久化需要的欄位)
export const WindowStateSchema = z.object({
  id: z.string(),
  title: z.string(),
  geometry: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  zIndex: z.number(),
  isMinimized: z.boolean().optional().default(false),
  content: ContentDescriptorSchema,
  internalState: z.unknown(), // 不透明狀態，不驗證內容
});

// 整個 Workspace 的快照結構
export const WorkspaceSnapshotSchema = z.object({
  windows: z.record(z.string(), WindowStateSchema),// Record<string, Window>
  stackOrder: z.array(z.string()),
});

export type WorkspaceSnapshot = z.infer<typeof WorkspaceSnapshotSchema>;