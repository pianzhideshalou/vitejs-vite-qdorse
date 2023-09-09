import {
  Leafer,
  Rect,
  DragEvent,
  Group,
  Text,
  MoveEvent,
  PointerEvent,
} from 'leafer-ui';
import { Column, Info, ScrollInfo } from './typing';

let from = 0;
let globalLeafer: Leafer;
let globalColumns: Column[] = [];
let globalDataSource: Record<string, string>[] = [];
const fixedGroup = ['scrollBar', 'tableHeader'];
export const initParams = {
  headerHeight: 30,
  rowHeight: 20,
  fontSize: 16,
  scrollBar: {
    width: 10,
    height: 20,
    margin: 2,
    zIndex: 100,
  },
};

export const initScrollBar = (
  leafer: Leafer,
  dataSource: Record<string, string>[],
  jumpIndex = 0
) => {
  const { width, height } = leafer;
  const { scrollBar, headerHeight } = initParams;
  initParams.scrollBar.height = computedScrollBarHeight(
    leafer,
    dataSource,
    jumpIndex
  );
  const rect = new Rect({
    x: width - scrollBar.width,
    y: initParams.headerHeight,
    width: scrollBar.width - scrollBar.margin * 2,
    height: scrollBar.height,
    fill: 'rgba(133,117,85, 0.8)',
    cornerRadius: 10,
    id: 'scrollBar',
    zIndex: scrollBar.zIndex,
  });

  rect.on(PointerEvent.ENTER, (e) => {
    e.target.fill = 'rgba(133,117,85, 1)';
  });
  rect.on(PointerEvent.LEAVE, (e) => {
    e.target.fill = 'rgba(133,117,85, 0.8)';
  });
  leafer.add(rect);

  const { viewCapacity } = getViewInfo(leafer);
  const scrollMaxHeight = height - scrollBar.height;

  const unitLength =
    (height - headerHeight - scrollBar.height) /
    (dataSource.length - viewCapacity);
  rect.y = unitLength * jumpIndex + headerHeight;
  const scrollParams = {
    height,
    scrollMaxHeight,
    headerHeight,
    viewCapacity,
    unitLength,
    scrollBar: {
      height: scrollBar.height,
    },
  };
  leafer.on(MoveEvent.MOVE, function (e) {
    setScroll(leafer, rect, e, dataSource, -0.1, scrollParams);
  });

  rect.on(DragEvent.DRAG, function (e) {
    setScroll(leafer, rect, e, dataSource, 1, scrollParams);
  });
};

const setScroll = (
  leafer: Leafer,
  rect: Rect,
  e: MoveEvent | DragEvent,
  dataSource: Record<string, string>[],
  val = 1,
  scrollInfo: ScrollInfo
) => {
  const { scrollMaxHeight, headerHeight, viewCapacity, unitLength } =
    scrollInfo;
  leafer.children = leafer.children.filter((item) =>
    fixedGroup.includes(item.id ?? '')
  );

  rect.y =
    rect.y + e.moveY * val >= scrollMaxHeight
      ? scrollMaxHeight
      : rect.y + e.moveY * val < headerHeight
      ? headerHeight
      : rect.y + e.moveY * val;

  from =
    rect.y === scrollMaxHeight
      ? dataSource.length - viewCapacity
      : Math.ceil((rect.y - headerHeight) / unitLength);

  initTableBody();
};

const tableHeaderInfo: Record<string, Info> = {};

export const initTableHeader = (leafer: Leafer, columns: Column[]) => {
  const { width, x, y } = leafer;
  const { fontSize, headerHeight } = initParams;

  const noSetWidthColWidth = columns.reduce((acc, cur) => {
    if (cur.width) {
      return '';
    }
    return acc + cur.title;
  }, '');
  const textWidth = getTextWidth(leafer, noSetWidthColWidth);
  const setColWidthSum = columns.reduce((acc, cur) => {
    if (cur.width) {
      return acc + cur.width;
    }
    return acc;
  }, 0);

  const widthRatio = (width - setColWidthSum) / textWidth;
  const thList = columns.map((item) => {
    return {
      ...item,
      width: item.width
        ? item.width
        : Math.floor(getTextWidth(leafer, item.title) * widthRatio),
    };
  });

  const group = new Group({ x, y, id: 'tableHeader' });

  thList.forEach((th, index) => {
    const midLength = thList.slice(0, index).reduce((acc, cur) => {
      return acc + cur.width;
    }, 0);
    const x = index === 0 ? 0 : midLength - index;
    tableHeaderInfo[th.dataIndex] = {
      x,
      width: th.width,
    };
    const rect = new Rect({
      x,
      y: 0,
      width: th.width,
      height: initParams.headerHeight,
      fill: '#417A77',
      stroke: '#b4c9fb',
    });
    group.add(rect);
    const text = new Text({
      x,
      y,
      width: th.width,
      textAlign: 'center',
      height: headerHeight,
      verticalAlign: 'middle',
      fill: '#000000',
      text: th.title,
      fontSize,
    });
    group.add(text);
  });

  leafer.add(group);
};

export const initTableBody = () => {
  const { x } = globalLeafer;
  const { rowHeight, fontSize, headerHeight } = initParams;
  const reRenderObj: Record<string, (val: string) => string> = {};
  globalColumns.forEach((column) => {
    if (column.reRender) {
      reRenderObj[column.dataIndex] = column.reRender;
    }
  });
  const { viewHeight, viewCapacity } = getViewInfo(globalLeafer);

  const dataGroup = new Group({
    x,
    y: computedTableOffset(viewCapacity, headerHeight, viewHeight, rowHeight),
  });
  for (
    let i = from;
    computedViewBoundary(i, from, viewCapacity, globalDataSource);
    i++
  ) {
    const rowGroup = new Group({ x });
    for (const key in globalDataSource[i]) {
      const { x, width } = tableHeaderInfo[key];

      const rect = new Rect({
        x,
        y: (i - from) * rowHeight,
        width,
        height: rowHeight,
        fill: i % 2 ? '#417A77' : '#A7AEE6',
        stroke: '#b4c9fb',
      });

      rect.on('click', (e) => {
        console.log(e);
      });
      rowGroup.add(rect);

      const text = new Text({
        x,
        y: (i - from) * rowHeight,
        fill: '#000000',
        text: reRenderObj[key]
          ? reRenderObj[key](globalDataSource[i][key])
          : globalDataSource[i][key],
        width,
        textAlign: 'center',
        fontSize,
      });

      rowGroup.add(text);
    }

    dataGroup.add(rowGroup);
  }
  globalLeafer.add(dataGroup, 0);
};

export const drawCanvasTable = (
  leafer: Leafer,
  columns: Column[],
  dataSource: Record<string, string>[],
  jumpIndex = 0
) => {
  const { viewCapacity } = getViewInfo(leafer);
  from = jumpIndex;
  globalColumns = columns;
  globalLeafer = leafer;
  globalDataSource = dataSource;
  initTableHeader(leafer, columns);
  dataSource.length > viewCapacity &&
    initScrollBar(leafer, dataSource, jumpIndex);
  initTableBody();
};

const getTextWidth = (leafer: Leafer, text: string) => {
  return leafer.canvas.measureText(text).width;
};

const computedScrollBarHeight = (
  leafer: Leafer,
  dataSource: Record<string, string>[],
  jumpIndex = 0
) => {
  const { height } = leafer;
  const { viewHeight, viewCapacity } = getViewInfo(leafer);
  const unitLength = (height - initParams.headerHeight) / dataSource.length;
  if (jumpIndex) {
    return initParams.scrollBar.height;
  }

  const targetHeight = initParams.scrollBar.height + viewCapacity * unitLength;
  return targetHeight < viewHeight ? Math.ceil(targetHeight) : viewHeight - 10;
};

export const getViewInfo = (leafer: Leafer) => {
  const { height } = leafer;
  const { headerHeight, rowHeight } = initParams;
  const viewHeight = height - headerHeight;
  const viewCapacity = Math.ceil(viewHeight / rowHeight);
  return {
    viewHeight,
    viewCapacity,
  };
};

const computedViewBoundary = (
  i: number,
  start: number,
  viewCapacity: number,
  dataSource: Record<string, string>[]
) => {
  if (dataSource.length > viewCapacity) {
    return (
      i < start + viewCapacity && start + viewCapacity <= dataSource.length
    );
  } else {
    return i < dataSource.length;
  }
};

const computedTableOffset = (
  viewCapacity: number,
  headerHeight: number,
  viewHeight: number,
  rowHeight: number
) => {
  return globalDataSource.length > viewCapacity
    ? from < Math.floor(globalDataSource.length - viewCapacity)
      ? headerHeight
      : headerHeight -
        (viewHeight % rowHeight ? rowHeight - (viewHeight % rowHeight) : 0)
    : headerHeight;
};
