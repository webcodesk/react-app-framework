export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.SubControlPanel',
      componentInstance: 'subControlPanel1',
    },
    events: [
      {
        name: 'onGoToAbout',
        targets: [
          {
            type: 'component',
            props: {
              pageName: 'about',
              componentName: 'usr.components.AboutPanel',
              componentInstance: 'aboutPanel1',
              isForward: true,
              forwardRule: {
                withQuery: true,
              }
            }
          }
        ],
      },
    ]
  },
];
