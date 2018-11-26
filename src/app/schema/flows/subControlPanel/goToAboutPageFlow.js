export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.SubControlPanel.SubControlPanel',
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
              componentName: 'usr.components.AboutPanel.AboutPanel',
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
                      functionName: 'usr.api.exposed.aboutPanelActions.firstMethodInChain',
                    },
                    events: [
                      {
                        name: 'returnValue1',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.exposed.aboutPanelActions.secondMethodInChain',
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
                                      componentName: 'usr.components.AboutPanel.AboutPanel',
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
