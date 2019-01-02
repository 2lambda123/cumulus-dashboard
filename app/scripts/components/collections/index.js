'use strict';
import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Sidebar from '../app/sidebar';
import { strings } from '../locale';

var Collections = createReactClass({
  displayName: strings.collections,

  propTypes: {
    children: PropTypes.object,
    location: PropTypes.object,
    params: PropTypes.object
  },

  render: function () {
    const { pathname } = this.props.location;
    const existingCollection = pathname !== '/collections/add';
    return (
      <div className='page__collections'>
        <div className='content__header'>
          <div className='row'>
            <h1 className='heading--xlarge heading--shared-content'>{strings.collections}</h1>
            {existingCollection ? <Link className='button button--large button--white button__addcollections button__arrow button__animation' to='/collections/add'>{strings.add_a_collection}</Link> : null}
          </div>
        </div>
        <div className='page__content'>
          <div className='row wrapper__sidebar'>
            {existingCollection ? <Sidebar currentPath={pathname} params={this.props.params} /> : null}
            <div className={existingCollection ? 'page__content--shortened' : 'page__content'}>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
});

export default connect(state => state)(Collections);
