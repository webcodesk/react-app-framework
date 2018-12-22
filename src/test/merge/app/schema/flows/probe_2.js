export default [
  {
    type: "component",
    props: { componentName: "usr.Form.Form", componentInstance: "form" },
    events: [
      {
        name: "onSubmit",
        targets: [
          {
            type: "userFunction",
            props: {
              functionName: "usr.api.myFunctions.function1"
            },
            events: [
              {
                name: 'success',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.Pane.Pane',
                      componentInstance: 'pane',
                      propertyName: 'data'
                    }
                  },
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.Pane.Pane',
                      componentInstance: 'pane',
                      propertyName: 'data2'
                    }
                  }
                ]
              },
              {
                name: 'error',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.ErrorPane.ErrorPane',
                      componentInstance: 'errorPane',
                      propertyName: 'error'
                    }
                  },
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.Pane.Pane',
                      componentInstance: 'pane',
                      propertyName: 'data2'
                    }
                  }
                ]
              },
              {
                name: 'resultData',
                targets: [
                  {
                    type: 'userFunction',
                    props: {
                      functionName: 'usr.api.myFunctions.transformData'
                    },
                    events: [
                      {
                        name: 'transformedData',
                        targets: [
                          {
                            type: 'userFunction',
                            props: {
                              functionName: 'usr.api.myFunctions.showTransformedData'
                            }
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
    ]
  }
];
