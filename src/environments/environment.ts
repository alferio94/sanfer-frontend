export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Sanfer Event Management',
  version: '1.0.0',
  defaultEventBanner: '/assets/images/events/default-banner.jpg',
  defaultUserPassword: 'Sanfer2025',
  supportEmail: 'support@sanfer.com.mx',
  // Configuraciones adicionales
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
  },
  theme: {
    defaultTheme: 'dark', // 'light' | 'dark' | 'auto'
    storageKey: 'sanfer-theme',
  },
};
