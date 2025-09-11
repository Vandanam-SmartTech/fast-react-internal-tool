// utils/getCroppedImg.ts
export const croppedImg = (
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  circular = false
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous"; // ⚡ for local blob & external URLs
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      const safeArea = Math.max(image.width, image.height) * 2;

      // canvas setup
      canvas.width = safeArea;
      canvas.height = safeArea;

      // move origin to center for rotation
      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-safeArea / 2, -safeArea / 2);

      // draw the image
      ctx.drawImage(image, (safeArea - image.width) / 2, (safeArea - image.height) / 2);

      const data = ctx.getImageData(0, 0, safeArea, safeArea);

      // resize canvas to final crop size
      canvas.width = crop.width;
      canvas.height = crop.height;

      // paste cropped data
      ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width / 2 - crop.x),
        Math.round(0 - safeArea / 2 + image.height / 2 - crop.y)
      );

      if (circular) {
        // create circular mask
        ctx.globalCompositeOperation = "destination-in";
        ctx.beginPath();
        ctx.arc(crop.width / 2, crop.height / 2, crop.width / 2, 0, 2 * Math.PI, false);
        ctx.fill();
      }

      // export as base64 PNG
      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = (err) => reject(err);
  });
};
