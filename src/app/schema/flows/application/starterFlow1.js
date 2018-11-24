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
              functionName: 'usr.api.exposed.setFirstString',
            },
            events: [
              {
                name: 'firstString',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.ControlPanel',
                      componentInstance: 'controlPanel1',
                      propertyName: 'firstDataString',
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
