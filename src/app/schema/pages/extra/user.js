export default [
  {
    pageVariantName: 'Default',
    mediaQuery: {
      minWidth: 992,
    },
    componentsTree: {
      type: '_PageGrid',
      props: {
        _rowsCount: 1,
        _columnsCount: 6,
        _rowsHeights: Array(1).fill(-1),
        _columnsWidths: Array(6).fill(-1),
        rows: `repeat(${1}, auto)`,
        columns: `repeat(${6}, 1fr)`,
        minRowHeight: '20px',
        gap: '8px',
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
          children: [
            {
              type: 'usr.components.extra.UserPanel.stories[0]',
              instance: 'userPanel1',
            }
          ]
        },
        {
          type: '_PageCell',
          props: {
            width: 1,
            height: 1,
            left: 2,
            top: 1,
          },
        },
      ]
    }
  }
];
