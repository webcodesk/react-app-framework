import queryString from 'query-string';
import forOwn from 'lodash/forOwn';
import uniqueId from 'lodash/uniqueId';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isObject';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NotFoundComponent from '../NotFoundComponent';
import createContainer from './Container';
import WarningComponent from '../WarningComponent';

let sendDebugMessage;
let constants;
if (process.env.NODE_ENV !== 'production') {
  sendDebugMessage = require('../../commons/sendMessage').default;
  constants = require('../../commons/constants');
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

  renderShape (descriptionShape) {
    const result = {};
    forOwn(descriptionShape, (value, prop) => {
      if (value) {
        if (isArray(value) && value.length > 0){
          result[prop] = this.renderArray(value);
        } else if (isPlainObject(value)) {
          if (value.type && value.instance) {
            result[prop] = this.renderComponent(value);
          } else {
            result[prop] = this.renderShape(value);
          }
        } else {
          result[prop] = value;
        }
      } else {
        result[prop] = value;
      }
    });
    return result;
  }

  renderArray (descriptionArray) {
    const result = [];
    if (descriptionArray.length > 0) {
      descriptionArray.forEach(descriptionItem => {
        if (descriptionItem) {
          if (isArray(descriptionItem)) {
            result.push(this.renderArray(descriptionItem));
          } else if (isPlainObject(descriptionItem)) {
            if (descriptionItem.type && descriptionItem.instance) {
              result.push(this.renderComponent(descriptionItem));
            } else {
              result.push(this.renderShape(descriptionItem));
            }
          } else {
            result.push(descriptionItem);
          }
        } else {
          result.push(descriptionItem);
        }
      });
    }
    return result;
  }

  renderComponent (description) {
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
        if (value) {
          if (isArray(value)) {
            propsComponents[prop] = this.renderArray(value);
          } else if (isPlainObject(value)) {
            if (value.type && value.instance) {
              propsComponents[prop] = this.renderComponent(value);
            } else {
              propsComponents[prop] = this.renderShape(value);
            }
          } else {
            propsComponents[prop] = value;
          }
        } else {
          propsComponents[prop] = value;
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
      if (!wrappedComponent || (typeof wrappedComponent !== 'function')) {
        return React.createElement(
          NotFoundComponent,
          { key: uniqueId('notFound'), componentName: validType }
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
      const parameterValue = pageParams ? pageParams['parameter'] : undefined;
      const normalizedRoutePath = routePath.substr(1).replace('/:parameter?', '');
      let propertyName = '';
      if (propertiesObject) {
        containerProperties = Object.keys(propertiesObject);
        if (!isUndefined(parameterValue) || (pageQuery && !isEmpty(pageQuery))) {
          forOwn(propertiesObject, (value, key) => {
            if (value && value.populatePath === normalizedRoutePath) {
              populatedProps[key] = parameterValue || pageQuery;
              propertyName = key;
            }
          });
        }
      }
      if (process.env.NODE_ENV !== 'production') {
        if (!isEmpty(populatedProps)) {
          sendDebugMessage({
            key: componentKey,
            eventType: constants.DEBUG_MSG_CREATE_CONTAINER_EVENT,
            inputData: populatedProps,
            populatePath: normalizedRoutePath,
            propertyName,
            componentName: type,
            componentInstance: instance,
            timestamp: Date.now(),
          });
        }
      }
      return createContainer(
        wrappedComponent,
        type,
        instance,
        componentKey,
        containerHandlers,
        containerProperties,
        { key: key || `${containerKey}_${uniqueId('c')}`, ...props, ...populatedProps, ...propsComponents },
        nestedComponents
      );
    }
  };

  renderPage () {
    const {componentsTree} = this.props;
    if (componentsTree && !isEmpty(componentsTree)) {
      return this.renderComponent(componentsTree);
    }
    return (<WarningComponent message="Page does not have components" />);
  }

  render () {
    return this.renderPage();
  }
}

export default PageComposition;
