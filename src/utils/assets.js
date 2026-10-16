// Asset dictionary and universal asset resolver for project images and media
export const ASSETS = {
  hero: './hero-desert-road.jpg',
  'hero-mobile': './road-hero-mobile.jpg',
  'works-paving': './assets/works-paving-44gaNtcl.jpg',
  'works-machinery': './assets/works-machinery-BJwBQY0f.jpg',
  'road-aerial': './assets/road-aerial-D0pjQklw.jpg',
  logo: './assets/logo-DzmZINsB.jpg'
};

/**
 * Universal Asset URL Resolver:
 * Ensures assets resolve cleanly whether running locally (Vite),
 * or hosted in subfolders like GitHub Pages (/-/portal/).
 */
export const resolveAsset = (path) => {
  if (!path) return './road-asphalt-paver.jpg';
  if (typeof path !== 'string') return path;
  if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const clean = path.replace(/^(\.\/|\/)/, '');
  return `./${clean}`;
};

export const getImageAsset = (key) => {
  return ASSETS[key] || ASSETS['works-paving'] || './assets/hero-desert-road-B8qYs_kL.jpg';
};

export const AVAILABLE_IMAGE_KEYS = [
  { key: 'works-paving', label: 'أعمال الرصف' },
  { key: 'works-machinery', label: 'الآليات والمعدات' },
  { key: 'road-aerial', label: 'الطريق من الجو' },
  { key: 'hero', label: 'الطريق الصحراوي 2.5K' },
  { key: 'hero-mobile', label: 'خلفية الجوال 4K' }
];
