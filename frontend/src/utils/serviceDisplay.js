export const normalizeCategoryName = (value = '') => (
  value
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

export const categoryMatches = (serviceCategory, activeCategory) => {
  const serviceName = normalizeCategoryName(serviceCategory);
  const activeName = normalizeCategoryName(activeCategory);

  return serviceName === activeName
    || serviceName === `${activeName}s`
    || `${serviceName}s` === activeName;
};

export const mapServiceCard = (service, fallbackImage = 'https://via.placeholder.com/400x300?text=No+Image') => ({
  id: service.id,
  name: service.serviceName || service.name,
  image: service.coverImage || service.image || fallbackImage,
  rating: service.rating || 5.0,
  location: service.city || service.location,
  price: service.price,
  priceType: service.priceType,
});
