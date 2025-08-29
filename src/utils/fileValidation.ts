export interface AllowedFileOptions {
  mimeTypes?: string[];
  extensions?: string[]; // without dot, e.g., ['pdf','jpg','png']
}

export const buildAcceptAttribute = (extensions: string[] = []): string => {
  if (!extensions.length) return '';
  return extensions.map((ext) => `.${ext.toLowerCase()}`).join(',');
};

export const isFileAllowed = (file: File, options: AllowedFileOptions): boolean => {
  if (!file) return false;
  const { mimeTypes = [], extensions = [] } = options || {};

  const fileType = file.type?.toLowerCase();
  const fileExt = file.name?.split('.').pop()?.toLowerCase();

  const mimeOk = mimeTypes.length ? mimeTypes.map((m) => m.toLowerCase()).includes(fileType) : true;
  const extOk = extensions.length ? extensions.map((e) => e.toLowerCase()).includes(fileExt || '') : true;

  return mimeOk && extOk;
};

export const buildAllowedOnlyMessage = (label: string, extensions: string[]): string => {
  const extList = extensions.map((e) => `.${e.toLowerCase()}`).join(', ');
  return `Only ${extList} are allowed for ${label}`;
};

export const kbToBytes = (kb: number): number => Math.round(kb * 1024);
export const mbToBytes = (mb: number): number => Math.round(mb * 1024 * 1024);

export const isFileSizeWithin = (file: File, maxBytes: number): boolean => {
  if (!file || !maxBytes) return true;
  return file.size <= maxBytes;
};

export const formatBytes = (bytes: number): string => {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${mb % 1 === 0 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
  }
  const kb = bytes / 1024;
  return `${kb % 1 === 0 ? kb.toFixed(0) : kb.toFixed(1)} KB`;
};

export const buildMaxSizeMessage = (label: string, maxBytes: number): string => {
  return `${label} must be ≤ ${formatBytes(maxBytes)}`;
};


