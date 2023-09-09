import { useEffect, useRef } from 'react';
import { Leafer } from 'leafer-ui';
import { drawCanvasTable } from './utils';
import { Column } from './typing';

type Props = {
  columns: Column[];
  dataSource: Record<string, string>[];
  option?: Record<string, unknown>;
  jumpIndex?: number;
};

function CanvasTable({ columns, dataSource, jumpIndex }: Props) {
  const canvasDom = useRef(null);

  useEffect(() => {
    if (canvasDom.current) {
      const leafer = new Leafer({
        view: canvasDom.current,
        width: 500,
        height: 800,
        move: { dragOut: false },
        type: 'user',
      });
      leafer.remove();
      drawCanvasTable(leafer, columns, dataSource, jumpIndex);
    }
  }, [columns, dataSource, jumpIndex]);

  return (
    <>
      <div ref={canvasDom}></div>
    </>
  );
}
export default CanvasTable;
