// This maps an index to a local required image so the frontend can display them directly.

export const LOCAL_IMAGES = [
  require('@/assets/Products/38.jpg'),
  require('@/assets/Products/39.jpg'),
  require('@/assets/Products/40.jpg'),
  require('@/assets/Products/41.jpg'),
  require('@/assets/Products/42.jpg'),
  require('@/assets/Products/43.jpg'),
  require('@/assets/Products/44.jpg'),
  require('@/assets/Products/download (1).jpg'),
  require('@/assets/Products/download (2).jpg'),
  require('@/assets/Products/download (3).jpg'),
  require('@/assets/Products/download (4).jpg'),
  require('@/assets/Products/download (5).jpg'),
  require('@/assets/Products/download (6).jpg'),
  require('@/assets/Products/download (7).jpg'),
  require('@/assets/Products/download (8).jpg'),
  require('@/assets/Products/download (9).jpg'),
  require('@/assets/Products/download (10).jpg'),
];

export const getLocalImage = (index: number) => {
  return LOCAL_IMAGES[index % LOCAL_IMAGES.length];
};

export const getLocalImageById = (id: string) => {
  if (!id) return LOCAL_IMAGES[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % LOCAL_IMAGES.length;
  return LOCAL_IMAGES[index];
};
