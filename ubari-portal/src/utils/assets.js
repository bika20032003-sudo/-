// Asset dictionary for project images and media
export const ASSETS = {
  hero: '/assets/hero-desert-road-B8qYs_kL.jpg',
  'works-paving': '/assets/works-paving-44gaNtcl.jpg',
  'works-machinery': '/assets/works-machinery-BJwBQY0f.jpg',
  'road-aerial': '/assets/road-aerial-D0pjQklw.jpg',
  logo: '/assets/logo-DzmZINsB.jpg'
};

export const getImageAsset = (key) => {
  return ASSETS[key] || ASSETS['works-paving'] || '/assets/hero-desert-road-B8qYs_kL.jpg';
};

export const AVAILABLE_IMAGE_KEYS = [
  { key: 'works-paving', label: 'أعمال الرصف' },
  { key: 'works-machinery', label: 'الآليات والمعدات' },
  { key: 'road-aerial', label: 'الطريق من الجو' },
  { key: 'hero', label: 'الطريق الصحراوي' }
];
