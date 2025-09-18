export const canvasToPngBlob = async (
  canvas: HTMLCanvasElement | OffscreenCanvas,
  mime: string = "image/png",
): Promise<Blob> => {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type: mime });
  }
  return new Promise<Blob>((resolve, reject) => {
    const htmlCanvas = canvas as HTMLCanvasElement;
    htmlCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Falha ao gerar PNG"));
        return;
      }
      resolve(blob);
    }, mime);
  });
};

