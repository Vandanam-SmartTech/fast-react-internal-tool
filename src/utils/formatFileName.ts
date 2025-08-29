export const formatFileName = (fileName: string, maxLength = 30) => {
  if (fileName.length <= maxLength) return fileName;

  const extIndex = fileName.lastIndexOf(".");
  const extension = extIndex !== -1 ? fileName.slice(extIndex) : "";
  const baseName = extIndex !== -1 ? fileName.slice(0, extIndex) : fileName;

  const front = baseName.slice(0, 10);
  const back = baseName.slice(-15);

  return `${front}.....${back}${extension}`;
};