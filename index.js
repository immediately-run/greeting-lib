import React from 'react';

export function Greeting({ name }) {
  return React.createElement(
    'div',
    {
      'data-testid': 'mounted-lib',
      style: { padding: 24, fontFamily: 'monospace', color: 'limegreen', fontSize: 26, fontWeight: 700 },
    },
    'MOUNTED LIBRARY RENDERED ✓ — ' + name,
  );
}
