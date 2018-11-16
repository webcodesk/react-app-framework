export default [
  {
    type: 'component',
    props: {
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
