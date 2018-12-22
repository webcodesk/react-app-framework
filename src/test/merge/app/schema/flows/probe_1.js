export default [
  {
    type: "component",
    props: {
      componentName: "usr.Form.Form",
      componentInstance: "form"
    },
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
                            type: 'component',
                            props: {
                              componentName: 'usr.Pane.Pane',
                              componentInstance: 'pane',
                              propertyName: 'data'
                            },
                            events: [
                              {
                                name: 'onClick',
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
                                            type: "component",
                                            props: {
                                              componentName: "usr.Form.Form",
                                              componentInstance: "form",
                                              propertyName: "formData"
                                            },
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
                ]
              },
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
                      propertyName: 'data4'
                    }
                  }
                ]
              },
            ]
          }
        ]
      },
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
                            type: "component",
                            props: {
                              componentName: "usr.Form.Form",
                              componentInstance: "form",
                              propertyName: "formData"
                            },
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
                                                    type: 'component',
                                                    props: {
                                                      componentName: 'usr.Pane.Pane',
                                                      componentInstance: 'pane',
                                                      propertyName: 'data3'
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
                              },
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
                                                    type: 'component',
                                                    props: {
                                                      componentName: 'usr.Pane.Pane',
                                                      componentInstance: 'pane',
                                                      propertyName: 'data'
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
