import { hashHistory } from 'react-router';

import { CALL_API } from '../actions';
import { configureRequest, get, post, put, del } from '../actions/helpers';
import log from '../utils/log';

const doRequestMiddleware = ({ dispatch }) => next => action => {
  let requestAction = action[CALL_API];
  if (!requestAction) {
    return next(action);
  }

  if (!requestAction.method) {
    throw new Error('Request action must include a method');
  }

  let query;
  if (requestAction.method === 'GET') {
    query = get;
  }
  if (requestAction.method === 'POST') {
    query = post;
  }
  if (requestAction.method === 'PUT') {
    query = put;
  }
  if (requestAction.method === 'DELETE') {
    query = del;
  }

  requestAction = Object.assign({}, requestAction, configureRequest(requestAction));

  const { id, type } = requestAction;

  const inflightType = type + '_INFLIGHT';
  log((id ? inflightType + ': ' + id : inflightType));
  dispatch({ id, config: requestAction, type: inflightType });

  const start = new Date();
  // Todo: can we return a promise here?
  query(requestAction, (error, data) => {
    if (error) {
      // Temporary fix until the 'logs' endpoint is fixed
      if (error.message.includes('Invalid Authorization token') && requestAction.url.includes('logs')) {
        const data = { results: [] };
        return next({ id, type, data, config: requestAction });
      }

      // Catch the session expired error
      // Weirdly error.message shows up as " : Session expired"
      // So it's using indexOf instead of a direct comparison
      if (error.message.includes('Session expired') ||
          error.message.includes('Invalid Authorization token') ||
          error.message.includes('Access token has expired')) {
        next({ type: 'LOGIN_ERROR', error: error.message.replace('Bad Request: ', '') });
        // Todo: this is a side effect. move out of middleware
        return hashHistory.push('/auth');
      }

      const errorType = type + '_ERROR';
      log((id ? errorType + ': ' + id : errorType));
      log(error);

      return next({
        id,
        config: requestAction,
        type: errorType,
        error
      });
    } else {
      const duration = new Date() - start;
      log((id ? type + ': ' + id : type), duration + 'ms');
      return next({ id, type, data, config: requestAction });
    }
  });
};

module.exports = {
  doRequestMiddleware
};
