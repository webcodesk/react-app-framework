export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.ControlPanel.ControlPanel',
      componentInstance: 'controlPanel1',
    },
    events: [
      {
        name: 'onDirectPassIn',
        targets: [
          {
            type: 'component',
            props: {
              componentName: 'usr.components.ViewPanel.ViewPanel',
              componentInstance: 'viewPanel1',
              propertyName: 'thirdDataString',
            },
          },
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.exposed.controlPanelActions.setDoubleSecondString'
            },
            events: [
              {
                name: 'secondDoubleString',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.ControlPanel.ControlPanel',
                      componentInstance: 'controlPanel1',
                      propertyName: 'secondDataString'
                    }
                  }
                ]
              }
            ]
          }
        ],
      },
    ]
  },
];
