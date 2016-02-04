/**
 * @fileOverview Axis of radial direction
 */
import React, { Component, PropTypes } from 'react';
import pureRender from 'pure-render-decorator';
import Layer from '../container/Layer';
import { PRESENTATION_ATTRIBUTES, getPresentationAttributes } from '../util/ReactUtils';
import Dot from '../shape/Dot';
import Polygon from '../shape/Polygon';
import { polarToCartesian } from '../util/PolarUtils';

const RADIAN = Math.PI / 180;
const eps = 1e-5;

@pureRender
class PolarAngleAxis extends Component {

  static displayName = 'PolarAngleAxis';

  static propTypes = {
    ...PRESENTATION_ATTRIBUTES,
    dataKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    cx: PropTypes.number,
    cy: PropTypes.number,
    radius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    hide: PropTypes.bool,

    axisLine: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    axisLineType: PropTypes.oneOf(['polygon', 'circle']),
    tickLine: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    label: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.object,
      PropTypes.element,
    ]),

    ticks: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.any,
      angle: PropTypes.number,
    })),
    orientation: PropTypes.oneOf(['inner', 'outer']),
    tickFormatter: PropTypes.func,
  };

  static defaultProps = {
    cx: 0,
    cy: 0,
    orientation: 'outer',
    fill: '#666',
    stroke: '#ccc',
    axisLine: true,
    tickLine: true,
    label: true,
    hide: false,
  };

  /**
   * Calculate the coordinate of line endpoint
   * @param  {Object} data The Data if ticks
   * @return {Object} (x0, y0): The start point of text, (x1, y1): The end point close to text, (x2, y2): The end point close to axis
   */
  getTickLineCoord(data) {
    const { cx, cy, radius, orientation, tickLine } = this.props;
    const tickLineSize = (tickLine && tickLine.size) || 8;
    const p1 = polarToCartesian(cx, cy, radius, data.angle);
    const p2 = polarToCartesian(
      cx, cy,
      radius + (orientation === 'inner' ? -1 : 1) * tickLineSize, data.angle
    );

    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
  }
  /**
   * Get the text-anchor of each tick
   * @param  {Object} data Data of ticks
   * @return {String} text-anchor
   */
  getTickTextAnchor(data) {
    const { orientation } = this.props;
    const cos = Math.cos(-data.angle * RADIAN);
    let textAnchor;

    if (cos > eps) {
      textAnchor = orientation === 'outer' ? 'start' : 'end';
    } else if (cos < -eps) {
      textAnchor = orientation === 'outer' ? 'end' : 'start';
    } else {
      textAnchor = 'middle';
    }

    return textAnchor;
  }

  renderAxisLine() {
    const { cx, cy, radius, axisLine, axisLineType } = this.props;
    const props = {
      ...getPresentationAttributes(this.props),
      fill: 'none',
      ...getPresentationAttributes(axisLine),
    };

    if (axisLineType === 'circle') {
      return <Dot className="recharts-polar-angle-axis-line" {...props} cx={cx} cy={cy} r={radius}/>;
    }
    const { ticks } = this.props;
    const points = ticks.map(entry => polarToCartesian(cx, cy, radius, entry.angle));

    return <Polygon className="recharts-polar-angle-axis-line" {...props} points={points}/>;
  }

  renderTicks() {
    const { ticks, label, tickLine, tickFormatter, stroke } = this.props;
    const axisProps = getPresentationAttributes(this.props);
    const customLabelProps = getPresentationAttributes(label);
    const isLabelElement = React.isValidElement(label);
    const tickLineProps = getPresentationAttributes(tickLine);

    const items = ticks.map((entry, i) => {
      const lineCoord = this.getTickLineCoord(entry);
      const textAnchor = this.getTickTextAnchor(entry);
      const tickProps = { ...axisProps, fill: 'none', ...tickLineProps, ...lineCoord };
      const labelProps = {
        textAnchor,
        ...axisProps,
        stroke: 'none', fill: stroke,
        ...customLabelProps,
        index: i, payload: entry,
        x: lineCoord.x2, y: lineCoord.y2,
      };
      let labelItem;

      if (label) {
        labelItem = isLabelElement ? React.cloneElement(label, labelProps) : (
          <text {...labelProps} className="recharts-polar-angle-axis-tick-value">
            {tickFormatter ? tickFormatter(entry.value) : entry.value}
          </text>
        );
      }

      return (
        <g className="recharts-polar-angle-axis-tick" key={'tick-' + i}>
          {tickLine && <line className="recharts-polar-angle-axis-tick-line" {...tickProps}/>}
          {label && labelItem}
        </g>
      );
    });

    return <g className="recharts-polar-angle-axis-ticks">{items}</g>;
  }

  render() {
    const { ticks, radius, axisLine, tickLine, label } = this.props;

    if (radius <= 0 || !ticks || !ticks.length) { return null; }

    return (
      <Layer className="recharts-polar-angle-axis">
        {axisLine && this.renderAxisLine()}
        {this.renderTicks()}
      </Layer>
    );
  }
}

export default PolarAngleAxis;