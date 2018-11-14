import queryString from 'query-string';
import forOwn from 'lodash/forOwn';
import uniqueId from 'lodash/uniqueId';
import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import NotFoundComponent from './NotFoundComponent';
import createContainer from './Container';

class PageComposition extends Component {

  static propTypes = {
    userComponents: PropTypes.object,
    pageName: PropTypes.string,
    pages: PropTypes.object,
    actionSequences: PropTypes.object,
    pageParams: PropTypes.object,
    pageSearch: PropTypes.string,
    populationTargets: PropTypes.array,
  };

  static defaultProps = {
    userComponents: {},
    pageName: '',
    pages: {},
    actionSequences: {},
    pageParams: {},
    pageSearch: '',
    populationTargets: [],
  };

  constructor (props) {
    super(props);
    this.renderPage = this.renderPage.bind(this);
    this.renderComponent = this.renderComponent.bind(this);
  }

  renderComponent (
    pageName,
    userComponents,
    description,
    actionSequences,
    pageParams,
    pageQuery,
    populationTargets
  ) {
    if (description) {
      const { type, instance, key, props, children } = description;
      const propsComponents = {};
      if (props) {
        forOwn(props, (value, prop) => {
          if (value && value.type && value.instance) {
            propsComponents[prop] = this.renderComponent(
              pageName,
              userComponents,
              value,
              actionSequences,
              pageParams,
              pageQuery,
              populationTargets
            );
          }
        });
      }
      let nestedComponents = [];
      if (children && children.length > 0) {
        nestedComponents = children.map(child => {
          return this.renderComponent(
            pageName,
            userComponents,
            child,
            actionSequences,
            pageParams,
            pageQuery,
            populationTargets
          );
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
        if (!wrappedComponent) {
          return React.createElement(
            NotFoundComponent,
            {key: uniqueId('notFound'), componentName: validType}
            );
        }
        const { _doNotCreateContainer } = props || {};
        const containerKey = `${pageName}_${type}_${instance}`;

        if (_doNotCreateContainer) {
          return React.createElement(
            wrappedComponent,
            { key: key || uniqueId(validType), ...props, ...propsComponents },
            nestedComponents
          );
        }

        let containerHandlers = [];
        const actionSequence = actionSequences[containerKey];
        console.info('Container key: ', containerKey, actionSequence);
        if (actionSequence) {
          containerHandlers = actionSequence.events;
        }
        let populatedProps = {};
        populationTargets.forEach(populationTarget => {
          const {
            componentName: targetComponentName,
            componentInstance: targetInstance,
            propertyName: targetPropertyName,
          } = populationTarget;
          if (targetComponentName === type && targetInstance === instance) {
            populatedProps[targetPropertyName] =
              pageParams[targetPropertyName] || pageQuery;

          }
        });
        console.info('Create container with page params: ', type, userComponents, populatedProps);
        console.info('Create container with handlers: ', containerHandlers);
        return createContainer(
          wrappedComponent,
          pageName,
          type,
          instance,
          containerHandlers,
          { key: key || containerKey, ...props, ...populatedProps, ...propsComponents }
        );
      }
    }
    return null;
  };

  renderPage () {
    const {
      userComponents,
      pages,
      pageName,
      actionSequences,
      pageParams,
      pageSearch,
      populationTargets
    } = this.props;
    if (pageName && pages) {
      const componentsTree = pages[pageName];
      if (componentsTree) {
        // console.info('Render page with components tree: ', componentsTree);
        const pageQuery = queryString.parse(pageSearch);
        return this.renderComponent(
          pageName,
          userComponents,
          componentsTree,
          actionSequences,
          pageParams,
          pageQuery,
          populationTargets
        );
      }
      return (<h1>Page {pageName} does not have components.</h1>);
    }
    return (<h1>Page name is not set.</h1>);
  }

  render () {
    return this.renderPage();
  }
}

export default PageComposition;
