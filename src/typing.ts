export type ScrollInfo = {
  height: number;
  scrollMaxHeight: number;
  headerHeight: number;
  viewCapacity: number;
  unitLength: number;
  scrollBar: {
    height: number;
  };
};

export type Column = {
  title: string;
  width?: number;
  dataIndex: string;
  reRender?: (val: string) => string;
};

export type Info = {
  x: number;
  width: number;
};
