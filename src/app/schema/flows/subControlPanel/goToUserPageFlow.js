export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.SubControlPanel.SubControlPanel',
      componentInstance: 'subControlPanel1',
    },
    events: [
      {
        name: 'onGoToUser',
        targets: [
          {
            type: 'component',
            props: {
              forwardPath: '/user',
            },
          }
        ],
      },
    ]
  },
];
