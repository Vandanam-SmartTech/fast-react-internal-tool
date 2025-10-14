export const croppedImgForLogo = (
  imageSrc: string,
  crop: any,
  rotation = 0,
  outputWidth = 768,
  outputHeight = 325
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) return reject("Canvas not supported");

      // Move and rotate canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        outputWidth,
        outputHeight
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject("Canvas is empty");
          return;
        }
        resolve(blob);
      }, "image/png");
    };
    image.onerror = (err) => reject(err);
  });
};
