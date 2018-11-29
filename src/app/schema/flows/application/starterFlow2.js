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
                name: 'firstString1',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.ControlPanel.ControlPanel',
                      componentInstance: 'controlPanel1',
                      propertyName: 'firstDataString1',
                    },
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
