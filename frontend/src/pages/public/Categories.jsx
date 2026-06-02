import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '../../components/layout/BackButton';
import api from '../../services/api';
import { categoryMatches, normalizeCategoryName } from '../../utils/serviceDisplay';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    let isCurrent = true;

    const refreshCategories = async () => {
      setCategoriesLoading(true);

      try {
        const [categoryRes, serviceRes] = await Promise.allSettled([
          api.get('/categories'),
          api.get('/services'),
        ]);

        if (!isCurrent) return;

        if (categoryRes.status === 'fulfilled') {
          const backendCategories = categoryRes.value.data.categories || [];
          if (backendCategories.length) setCategories(backendCategories);
        }

        if (serviceRes.status === 'fulfilled') {
          setServices(serviceRes.value.data.services || []);
        }
      } finally {
        if (isCurrent) setCategoriesLoading(false);
      }
    };

    refreshCategories();

    const onServicesUpdated = () => {
      if (isCurrent) refreshCategories();
    };

    window.addEventListener('servicesUpdated', onServicesUpdated);

    return () => {
      isCurrent = false;
      window.removeEventListener('servicesUpdated', onServicesUpdated);
    };
  }, []);

  const serviceCounts = useMemo(() => (
    categories.reduce((counts, category) => ({
      ...counts,
      [category.id]: services.filter(service => categoryMatches(service.category, category.name)).length,
    }), {})
  ), [categories, services]);

  const visibleCategories = useMemo(() => {
    const servicesByCategory = services.reduce((groups, service) => {
      const categoryName = service.category || service.serviceType;
      if (!categoryName) return groups;

      const key = normalizeCategoryName(categoryName);
      return {
        ...groups,
        [key]: {
          name: categoryName,
          count: (groups[key]?.count || 0) + 1,
        },
      };
    }, {});

    const matchedCategories = categories
      .map(category => {
        const match = Object.entries(servicesByCategory).find(([, group]) => (
          categoryMatches(group.name, category.name)
        ));

        return match ? { ...category, serviceCount: match[1].count } : null;
      })
      .filter(Boolean);

    const matchedNames = new Set(matchedCategories.map(category => normalizeCategoryName(category.name)));
    const serviceOnlyCategories = Object.values(servicesByCategory)
      .filter(group => !matchedNames.has(normalizeCategoryName(group.name)))
      .map(group => ({
        id: group.name,
        name: group.name,
        description: 'Tourism services in Trincomalee',
        serviceCount: group.count,
      }));

    return [...matchedCategories, ...serviceOnlyCategories];
  }, [categories, services]);

  return (
    <div className="container section-padding animate-fade-in">
      <div style={{ marginBottom: '12px' }}>
        <BackButton fallback="/" />
      </div>

      <div className="text-center" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>All Categories</h1>
        <p>Browse through all available services in Trincomalee</p>
      </div>

      {visibleCategories.length > 0 ? (
        <>
          {categoriesLoading && (
            <p style={{ marginBottom: '16px', color: 'var(--text-light)', fontSize: '14px' }}>Refreshing categories...</p>
          )}
          <div className="grid-3">
            {visibleCategories.map(category => (
              <Link to={`/category/${encodeURIComponent(category.name)}`} key={category.id}>
                <div className="card text-center" style={{ cursor: 'pointer', padding: '40px 20px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0, 102, 204, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '24px',
                    color: 'var(--primary-color)'
                  }}>
                    {category.name.charAt(0)}
                  </div>
                  <h3 style={{ marginBottom: '10px', fontSize: '24px' }}>{category.name}</h3>
                  <p>{category.description || 'Tourism services in Trincomalee'}</p>
                  <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--primary-color)', fontWeight: 600 }}>
                    {category.serviceCount || serviceCounts[category.id] || 0} services
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : categoriesLoading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading categories...</div>
      ) : (
        <div className="card text-center" style={{ padding: '50px 20px' }}>
          <p>No categories yet. Categories will appear here after owners add services.</p>
        </div>
      )}
    </div>
  );
};

export default Categories;
