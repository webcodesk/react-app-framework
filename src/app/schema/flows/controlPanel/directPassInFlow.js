export default [
  {
    type: 'component',
    props: {
      pageName: 'home',
      componentName: 'usr.components.ControlPanel',
      componentInstance: 'controlPanel1',
    },
    events: [
      {
        name: 'onDirectPassIn',
        targets: [
          {
            type: 'component',
            props: {
              pageName: 'home',
              componentName: 'usr.components.ViewPanel',
              componentInstance: 'viewPanel1',
              propertyName: 'thirdDataString',
            },
          },
        ],
      },
    ]
  },
];
