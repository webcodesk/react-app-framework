import queryString from 'query-string';
import forOwn from 'lodash/forOwn';
import uniqueId from 'lodash/uniqueId';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NotFoundComponent from '../NotFoundComponent';
import createContainer from './Container';

let sendDebugMessage;

if (process.env.NODE_ENV !== 'production') {
  sendDebugMessage = require('../../commons/sendMessage').default;
}

class PageComposition extends Component {

  static propTypes = {
    userComponents: PropTypes.object,
    componentsTree: PropTypes.object,
    actionSequences: PropTypes.object,
    targetProperties: PropTypes.object,
    routePath: PropTypes.string,
    pageParams: PropTypes.object,
    pageSearch: PropTypes.string,
  };

  static defaultProps = {
    userComponents: {},
    componentsTree: {},
    actionSequences: {},
    targetProperties: {},
    routePath: '',
    pageParams: {},
    pageSearch: '',
  };

  constructor (props) {
    super(props);
    this.renderPage = this.renderPage.bind(this);
    this.renderComponent = this.renderComponent.bind(this);
  }

  renderComponent (
    description,
  ) {
    const {
      userComponents,
      actionSequences,
      targetProperties,
      routePath,
      pageParams,
      pageSearch,
    } = this.props;
    const pageQuery = queryString.parse(pageSearch);
    if (!description) {
      return null;
    }
    const { type, instance, key, props, children } = description;
    if (!type) {
      return null;
    }
    const propsComponents = {};
    if (props) {
      forOwn(props, (value, prop) => {
        if (value && value.type && value.instance) {
          propsComponents[prop] = this.renderComponent(value);
        }
      });
    }
    let nestedComponents = [];
    if (children && children.length > 0) {
      nestedComponents = children.map(child => {
        return this.renderComponent(child);
      });
    }
    const validType = type || 'div';
    if (validType.charAt(0) === '_') {
      const pageComponentType = validType.substr(1);
      return React.createElement(
        pageComponentType,
        { key: key || uniqueId(validType), ...props, ...propsComponents },
        nestedComponents
      );
    } else {
      // this is a user custom component, create container for it
      const wrappedComponent = get(userComponents, validType, null);
      if (!wrappedComponent || (typeof wrappedComponent !== 'function' && !wrappedComponent.renderStory)) {
        return React.createElement(
          NotFoundComponent,
          { key: uniqueId('notFound'), componentName: validType }
        );
      }
      if (wrappedComponent.renderStory) {
        return React.createElement(
          wrappedComponent.renderStory,
          { key: key || uniqueId(validType), ...props, ...propsComponents },
          nestedComponents
        );
      }
      const { _doNotCreateContainer } = props || {};
      const containerKey = `${type}_${instance}`;

      if (_doNotCreateContainer) {
        return React.createElement(
          wrappedComponent,
          { key: key || uniqueId(validType), ...props, ...propsComponents },
          nestedComponents
        );
      }

      let containerHandlers = [];
      let componentKey;
      const actionSequence = actionSequences[containerKey];
      if (actionSequence) {
        containerHandlers = actionSequence.events;
        componentKey = actionSequence.componentKey;
      }
      let populatedProps = {};
      let containerProperties = [];
      const propertiesObject = targetProperties[containerKey];
      const parameterValue = pageParams ? pageParams['parameter'] : null;
      const normalizedRoutePath = routePath.substr(1).replace('/:parameter?', '');
      if (propertiesObject) {
        containerProperties = Object.keys(propertiesObject);
        if (parameterValue || (pageQuery && !isEmpty(pageQuery))) {
          forOwn(propertiesObject, (value, key) => {
            if (value && value.forwardPath === normalizedRoutePath) {
              populatedProps[key] = parameterValue || pageQuery;
            }
          });
        }
      }
      if (process.env.NODE_ENV !== 'production') {
        sendDebugMessage({
          key: componentKey,
          eventType: 'createContainer',
          populatedProps,
          type,
          instance,
          timestamp: Date.now(),
        });
        console.info('[DebugMsg]: ', JSON.stringify({
          key: componentKey,
          eventType: 'createContainer',
          populatedProps: {},
          type,
          instance,
          timestamp: Date.now(),
        }));
      }
      return createContainer(
        wrappedComponent,
        type,
        instance,
        componentKey,
        containerHandlers,
        containerProperties,
        { key: key || containerKey, ...props, ...populatedProps, ...propsComponents },
        nestedComponents
      );
    }
  };

  renderPage () {
    const {componentsTree} = this.props;
    if (componentsTree && !isEmpty(componentsTree)) {
      return this.renderComponent(componentsTree);
    }
    return (<h1>Page does not have components.</h1>);
  }

  render () {
    return this.renderPage();
  }
}

export default PageComposition;
