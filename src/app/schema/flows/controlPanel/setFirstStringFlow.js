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
        name: 'onFirstClick',
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
                      pageName: 'home',
                      componentName: 'usr.components.ControlPanel',
                      componentInstance: 'controlPanel1',
                      propertyName: 'firstDataString',
                    },
                    events: [
                      {
                        name: 'onFirstClick',
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
                                      pageName: 'home',
                                      componentName: 'usr.components.ViewPanel',
                                      componentInstance: 'viewPanel1',
                                      propertyName: 'firstDataString',
                                    }
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
  },
  {
    type: 'component',
    props: {
      pageName: 'home',
      componentName: 'usr.components.ControlPanel',
      componentInstance: 'controlPanel1',
    },
    events: [
      {
        name: 'onSecondClick',
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
                      pageName: 'home',
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
                      pageName: 'home',
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
