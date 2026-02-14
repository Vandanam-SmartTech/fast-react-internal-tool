export const optimizeImage = (src: string, width?: number) => {
  if (!src) return src;
  const img = new Image();
  img.loading = 'lazy';
  if (width) img.width = width;
  return src;
};

export const LazyImage = ({ src, alt, className, width }: any) => (
  <img src={src} alt={alt} className={className} width={width} loading="lazy" decoding="async" />
);
