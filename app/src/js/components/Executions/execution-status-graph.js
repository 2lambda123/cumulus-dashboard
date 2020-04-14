'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { window } from '../../utils/browser';
import dagre from 'dagre-d3';
import * as d3 from 'd3';

import {
  getExecutionEvents,
  workflowToGraph,
  addEventsToGraph,
  draw
} from './execution-graph-utils';
import Modal from 'react-bootstrap/Modal';

// dagre-d3 expects d3 to be attached to the window
if (process.env.NODE_ENV !== 'test') window.d3 = d3;

class ExecutionStatusGraph extends React.Component {
  constructor () {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.onShow = this.onShow.bind(this);
    this.onHide = this.onHide.bind(this);
    this.state = {
      showModal: false
    };
  }

  componentDidMount () {
    const {
      executionStatus: {
        executionHistory,
        stateMachine
      }
    } = this.props;

    const workflow = JSON.parse(stateMachine.definition);

    const events = getExecutionEvents(executionHistory);
    const graph = workflowToGraph(workflow);
    addEventsToGraph(events, graph);
    this.g = draw(graph);
    this.renderGraph('.visual', this.g);
  }

  componentWillUnmount () {
    this.g = null;
  }

  renderGraph (svgSelector) {
    const render = new dagre.render();
    const svg = d3.select(svgSelector);
    render(svg, this.g);
    const height = d3.select(`${svgSelector} g`).node().getBBox().height;
    const width = d3.select(`${svgSelector} g`).node().getBBox().width;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    svg.attr('width', '100%');
    svg.attr('height', '100%');
  }

  handleClick (e) {
    e.preventDefault();
    this.setState({ showModal: true });
  }

  onHide () {
    this.setState({ showModal: false });
  }

  onShow () {
    this.renderGraph('.modal-svg');
  }

  render () {
    const { showModal } = this.state;
    return (
      <div className='execution__visual'>
        <div className='header' onClick={this.handleClick}>
          <div>Click <i className='fa fa-expand'></i> to enlarge to fullscreen</div>
          <div onClick={this.handleClick}><i className='fa fa-expand'></i></div>
        </div>
        <div className='execution__content'>
          <div className='execution__content--visual'>
            <svg className='visual'></svg>
          </div>
        </div>
        <Modal show={showModal}
          onHide={this.onHide}
          onShow={this.onShow}
          className='default-modal execution__modal--visual'>
          <Modal.Header>
            <div className='header'>
              <div>Click <i className='fa fa-compress'></i> to return to execution view</div>
              <div onClick={this.onHide}><i className='fa fa-compress'></i></div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <svg className='modal-svg'></svg>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

ExecutionStatusGraph.propTypes = {
  executionStatus: PropTypes.object
};

export default connect(state => ({}))(ExecutionStatusGraph);
