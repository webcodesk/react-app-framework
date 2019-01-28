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
              functionName: "usr.api.myFunctions.checkFormValidity"
            },
            events: [
              {
                name: "errors",
                targets: [
                  {
                    type: "component",
                    props: {
                      componentName: "usr.SubmitForm.SubmitForm",
                      componentInstance: "form",
                      propertyName: "errors",
                    },
                    events: [
                      {
                        name: "onCancel",
                        targets: [
                          {
                            type: "component",
                            props: {
                              componentName: "usr.Header.Header",
                              componentInstance: "headerTest",
                              propertyName: "errorText"
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                name: "success",
                targets: [
                  {
                    type: "userFunction",
                    props: {
                      functionName: "usr.api.myFunctions.getDataByForm"
                    },
                    events: [
                      {
                        name: "loading",
                        targets: [
                          {
                            type: "component",
                            props: {
                              componentName: "usr.GlobalSpinner.GlobalSpinner",
                              componentInstance: "globalSpinner1"
                            }
                          }
                        ]
                      },
                      {
                        name: "loading",
                        targets: [
                          {
                            type: "component",
                            props: {
                              componentName: "usr.LocalSpinner.LocalSpinner",
                              componentInstance: "localSpinner1"
                            }
                          }
                        ]
                      },
                      {
                        name: "resultData",
                        targets: [
                          {
                            type: "component",
                            props: {
                              componentName: "usr.PaneInfo.PaneInfo",
                              componentInstance: "paneInfo",
                              propertyName: "data"
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
        name: "onGoBack",
        targets: [
          {
            type: "component",
            props: {
              forwardPath: "landingPage",
            },
            events: [
              {
                name: "queryParams",
                targets: [
                  {
                    type: "component",
                    props: {
                      componentName: "usr.Landing.Landing",
                      componentInstance: "landingPane",
                      propertyName: "formHistory",
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "onGoBack",
        targets: [
          {
            type: "component",
            props: {
              componentName: "usr.Landing.Landing",
              componentInstance: "landingPane2",
              propertyName: "formHistory",
            }
          }
        ]
      }
    ]
  }
];
