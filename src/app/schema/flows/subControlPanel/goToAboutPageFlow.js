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
            },
            events: [
              {
                name: 'onRunMethodsChain',
                targets: [
                  {
                    type: 'userFunction',
                    props: {
                      functionName: 'usr.api.exposed.firstMethodInChain',
                    },
                    events: [
                      {
                        name: 'returnValue1',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.exposed.secondMethodInChain',
                            },
                            events: [
                              {
                                name: 'returnValue2',
                                targets: [
                                  {
                                    type: 'component',
                                    props: {
                                      pageName: 'home',
                                      isForward: true,
                                    }
                                  },
                                  {
                                    type: 'component',
                                    props: {
                                      componentName: 'usr.components.AboutPanel',
                                      componentInstance: 'aboutPanel1',
                                      propertyName: 'authorData'
                                    }
                                  },
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
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
