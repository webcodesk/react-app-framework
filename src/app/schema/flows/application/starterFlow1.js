export default [
  {
    type: 'component',
    props: {
      componentName: 'applicationStartWrapper',
      componentInstance: 'wrapperInstance',
    },
    events: [
      {
        name: 'onComponentDidMount',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.exposed.controlPanelActions.setFirstString',
            },
            events: [
              {
                name: 'firstString',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.ControlPanel.ControlPanel',
                      componentInstance: 'controlPanel1',
                      propertyName: 'firstDataString',
                    },
                  }
                ]
              }
            ]
          },
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.exposed.controlPanelActions.setDoubleStrings',
            },
            events: [
              {
                name: 'firstStringD',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.ViewPanel.ViewPanel',
                      componentInstance: 'viewPanel1',
                      propertyName: 'firstDataString',
                    },
                  },
                ],
              },
              {
                name: 'secondStringD',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.ControlPanel.ControlPanel',
                      componentInstance: 'controlPanel1',
                      propertyName: 'firstDataString',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
  },
];
