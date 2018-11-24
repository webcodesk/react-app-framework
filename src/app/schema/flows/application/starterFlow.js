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
              functionName: 'usr.api.exposed.setDoubleStrings',
            },
            events: [
              {
                name: 'firstStringD',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.ViewPanel',
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
                      componentName: 'usr.components.ViewPanel',
                      componentInstance: 'viewPanel1',
                      propertyName: 'secondDataString',
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
