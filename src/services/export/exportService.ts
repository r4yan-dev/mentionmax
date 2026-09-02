export type ExportFormat = "png" | "jpg" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  fileName: string;
  pageSize?: "A4";
}

export const exportService = {
  async exportRenderedLesson(_element: HTMLElement, _options: ExportOptions): Promise<void> {
    throw new Error("Rendered lesson export is not wired in the foundation phase.");
  },
};
