/**
 * @fileOverview X Axis
 */
import type { SVGProps } from 'react';
import React, { Component, useEffect } from 'react';
import clsx from 'clsx';
import { useChartHeight, useChartWidth, useXAxisOrThrow } from '../context/chartLayoutContext';
import { CartesianAxis } from './CartesianAxis';
import { AxisInterval, AxisTick, BaseAxisProps, CartesianTickItem } from '../util/types';
import { AxisPropsNeededForTicksGenerator, getTicksOfAxis } from '../util/ChartUtils';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { addXAxis, removeXAxis, XAxisPadding, XAxisSettings } from '../state/axisMapSlice';
import { XAxisWithExtraData } from '../chart/types';
import { selectAxisRange, selectAxisScale, selectNiceTicks } from '../state/selectors/axisSelectors';

interface XAxisProps extends BaseAxisProps {
  /** The unique id of x-axis */
  xAxisId?: string | number;
  /** The height of axis, which need to be set by user */
  height?: number;
  mirror?: boolean;
  // The orientation of axis
  orientation?: 'top' | 'bottom';
  /**
   * Ticks can be any type when the axis is the type of category
   * Ticks must be numbers when the axis is the type of number
   */
  ticks?: ReadonlyArray<AxisTick>;
  padding?: XAxisPadding;
  minTickGap?: number;
  interval?: AxisInterval;
  reversed?: boolean;
  /** the rotate angle of tick */
  angle?: number;
  tickMargin?: number;
}

export type Props = Omit<SVGProps<SVGLineElement>, 'scale'> & XAxisProps;

function SetXAxisSettings(settings: XAxisSettings): null {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(addXAxis(settings));
    return () => {
      dispatch(removeXAxis(settings));
    };
  }, [settings, dispatch]);
  return null;
}

const XAxisImpl = (props: Props) => {
  const { xAxisId, className } = props;
  const width = useChartWidth();
  const height = useChartHeight();
  const axisOptions: XAxisWithExtraData = useXAxisOrThrow(xAxisId);
  const axisType = 'xAxis';
  const scaleObj = useAppSelector(state => selectAxisScale(state, axisType, xAxisId));
  const niceTicks = useAppSelector(state => selectNiceTicks(state, axisType, xAxisId));
  const range = useAppSelector(state => selectAxisRange(state, axisType, xAxisId));

  if (axisOptions == null || scaleObj == null) {
    return null;
  }

  const tickGeneratorInput: AxisPropsNeededForTicksGenerator = {
    axisType,
    categoricalDomain: axisOptions.categoricalDomain,
    duplicateDomain: axisOptions.duplicateDomain,
    isCategorical: axisOptions.isCategorical,
    niceTicks,
    range,
    realScaleType: scaleObj.realScaleType,
    scale: scaleObj.scale,
    tickCount: props.tickCount,
    ticks: props.ticks,
    type: props.type,
  };
  const cartesianTickItems: ReadonlyArray<CartesianTickItem> = getTicksOfAxis(tickGeneratorInput, true);

  const { ref, dangerouslySetInnerHTML, ticks, ...allOtherProps } = props;

  return (
    <CartesianAxis
      {...allOtherProps}
      scale={scaleObj.scale}
      x={axisOptions.x}
      y={axisOptions.y}
      width={axisOptions.width}
      height={axisOptions.height}
      className={clsx(`recharts-${axisType} ${axisType}`, className)}
      viewBox={{ x: 0, y: 0, width, height }}
      ticks={cartesianTickItems}
    />
  );
};

const XAxisSettingsDispatcher = (props: Props) => {
  return (
    <>
      <SetXAxisSettings
        id={props.xAxisId}
        scale={props.scale}
        type={props.type}
        padding={props.padding}
        allowDataOverflow={props.allowDataOverflow}
        domain={props.domain}
        dataKey={props.dataKey}
        allowDuplicatedCategory={props.allowDuplicatedCategory}
        allowDecimals={props.allowDecimals}
        tickCount={props.tickCount}
        includeHidden={props.includeHidden ?? false}
        reversed={props.reversed}
        ticks={props.ticks}
      />
      <XAxisImpl {...props} />
    </>
  );
};

// eslint-disable-next-line react/prefer-stateless-function
export class XAxis extends Component<Props> {
  static displayName = 'XAxis';

  static defaultProps = {
    allowDecimals: true,
    hide: false,
    orientation: 'bottom',
    height: 30,
    mirror: false,
    xAxisId: 0,
    tickCount: 5,
    type: 'category',
    padding: { left: 0, right: 0 },
    allowDataOverflow: false,
    scale: 'auto',
    reversed: false,
    allowDuplicatedCategory: true,
  };

  render() {
    return <XAxisSettingsDispatcher {...this.props} />;
  }
}
