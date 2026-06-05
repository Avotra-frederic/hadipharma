const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL || import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '');

export const getUploadImageUrl = (photo?: string): string => {
  if (!photo) return '';
  if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;

  const base = UPLOADS_BASE_URL?.replace(/\/$/, '') ?? '';
  const cleanedPhoto = photo.startsWith('/') ? photo : `/${photo}`;

  return `${base}${cleanedPhoto}`;
};
