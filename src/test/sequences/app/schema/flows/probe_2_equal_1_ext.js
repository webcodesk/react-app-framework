export default [
  {
    type: "component",
    props: { componentName: "usr.Form.Form", componentInstance: "form" },
    events: [
      {
        name: "onSubmit",
        targets: [
          {
            type: "component",
            props: {
              componentName: "usr.Header.Header",
              componentInstance: "headerTest1",
              propertyName: "title"
            }
          }
        ]
      },
      {
        name: "onCancel",
        targets: [
          {
            type: "component",
            props: {
              componentName: "usr.Header.Header",
              componentInstance: "headerTest1",
              propertyName: "title"
            }
          }
        ]
      }
    ]
  }
];
