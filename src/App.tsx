import { useRef, useState } from 'react';
import CanvasTable from './CanvasTable';
import { Button, Input } from 'antd';
import type { InputRef } from 'antd';

function App() {
  const [jumpIndex, setJumpIndex] = useState(0);
  const inputRef = useRef(null);
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '详细地点',
      dataIndex: 'detailAddress',
    },
    {
      title: '时间',
      dataIndex: 'time',
      reRender: (val: string) => {
        return val;
      },
    },
  ];
  const dataSource: Record<string, string>[] = [];
  for (let i = 0; i < 1000000; i++) {
    dataSource.push({
      name: `Row ${i}`,
      detailAddress: `Detail ${i}`,
      time: i.toString(),
    });
  }
  const toJumpRow = () => {
    if (inputRef.current) {
      const value = (inputRef.current as InputRef).input?.value;
      setJumpIndex(Number(value));
    }
  };
  return (
    <>
      <div style={{ display: 'flex' }}>
        <Input ref={inputRef} />
        <Button type="primary" onClick={() => toJumpRow()}>
          Scroll To
        </Button>
      </div>

      <CanvasTable
        columns={columns}
        dataSource={dataSource}
        jumpIndex={jumpIndex}
      />
    </>
  );
}

export default App;
