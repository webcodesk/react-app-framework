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
              functionName: "usr.api.myFunctions.validateForm"
            },
            events: [
              {
                name: "success",
                targets: [
                  {
                    type: "component",
                    props: {
                      componentName: "usr.Form.Form",
                      componentInstance: "form",
                      propertyName: "notificationText"
                    },
                  }
                ]
              },
              {
                name: "delayed",
                targets: [
                  {
                    type: "component",
                    props: {
                      componentName: "usr.Form.Form",
                      componentInstance: "form",
                      propertyName: "delayedObject"
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
];
