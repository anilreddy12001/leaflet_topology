
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import allReducers from '../reducers/rootReducer';
import createLogger from 'redux-logger';

const store = createStore(
    allReducers,
    applyMiddleware(thunk, promise, createLogger())
);

export default store;