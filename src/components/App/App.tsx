import React, { useRef } from 'react';
import PrintButton from '../PrintButton';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Props = {};

// eslint-disable-next-line no-unused-vars
export const App: React.FC<Props> = (_: Props) => {
  const ref = useRef(null);
  return (
    <>
      <div ref={ref}>Printed!</div>
      <div>No Print.</div>
      <PrintButton target={() => ref.current}>Button</PrintButton>
    </>
  );
};
