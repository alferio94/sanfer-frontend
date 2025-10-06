export const environment = {
  production: true,
  apiUrl: 'https://sanfer-backend-qa.up.railway.app', // Cambiar por tu URL de producción
  appName: 'Demo APP',
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
