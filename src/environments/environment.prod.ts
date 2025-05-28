export const environment = {
  production: true,
  apiUrl: 'https://api.sanfer.com.mx/api', // Cambiar por tu URL de producción
  appName: 'Sanfer Event Management',
  version: '1.0.0',
  defaultEventBanner: '/assets/images/events/default-banner.jpg',
  defaultUserPassword: 'Sanfer2025',
  supportEmail: 'support@sanfer.com.mx',
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
  },
  theme: {
    defaultTheme: 'light',
    storageKey: 'sanfer-theme',
  },
};
