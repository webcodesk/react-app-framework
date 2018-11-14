const pageModel = {
  type: '_div',
  props: {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }
  },
  children: [
    // First row
    {
      type: '_PageCell',
      props: {
        width: 1,
        height: 1,
        left: 1,
        top: 1,
      },
    },
  ]
};

export default pageModel;