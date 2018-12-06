export default [
  {
    path: '/',
    pageName: 'home',
  },
  {
    path: '/home',
    pageName: 'home',
  },
  {
    path: '/about',
    pageName: 'about',
    populationTargets: [
      {
        componentName: 'usr.components.AboutPanel.AboutPanel',
        componentInstance: 'aboutPanel1',
        propertyName: 'authorDataPopulated',
      }
    ],
  },
  {
    path: '/user',
    pageName: 'extra.user',
  }
];