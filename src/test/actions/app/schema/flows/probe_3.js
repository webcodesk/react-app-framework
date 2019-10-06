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
              functionName: "framework.storeItemFunction",
              transformScript: "function (input) { return input; }"
            },
            events: [
              {
                name: "success",
                targets: [
                  {
                    type: "component",
                    props: {
                      componentName: "usr.Panel.Panel",
                      componentInstance: "panel",
                      propertyName: "notificationText",
                      transformScript: "function (input) { return input; }"
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
                      propertyName: "delayedObject",
                      transformScript: "function (input) { return input; }"
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
