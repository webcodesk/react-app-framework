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
              defaultArgument: {

              },
              secondaryArgument: {
                storeItemName: "myInputObject",
                storeItemAction: "getItem"
              },
              transformInput: "function (input) { return input; }"
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
                      transformInput: "function (input) { return input; }"
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
                      transformInput: "function (input) { return input; }"
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
