import queryString from 'query-string';
import forOwn from 'lodash/forOwn';
import uniqueId from 'lodash/uniqueId';
import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PageCell from './PageCell';
import PageGrid from './PageGrid';
import NotFoundComponent from './NotFoundComponent';
import createContainer from './Container';

const pageComponents = {
  PageCell,
  PageGrid,
};

class PageComposition extends Component {

  static propTypes = {
    userComponents: PropTypes.object,
    componentsTree: PropTypes.object,
    actionSequences: PropTypes.object,
    pageParams: PropTypes.object,
    pageSearch: PropTypes.string,
    populationTargets: PropTypes.array,
  };

  static defaultProps = {
    userComponents: {},
    componentsTree: {},
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
        const pageComponent = pageComponents[pageComponentType];
        return React.createElement(
          pageComponent || pageComponentType,
          { key: key || uniqueId(validType), ...props, ...propsComponents },
          nestedComponents
        );
      } else {
        // this is a user custom component, create container for it
        const wrappedComponent = get(userComponents, validType, null);
        if (!wrappedComponent) {
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
        const actionSequence = actionSequences[containerKey];
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
            if (targetPropertyName) {
              populatedProps[targetPropertyName] =
                pageParams[targetPropertyName] || pageQuery;
            } else {
              // todo: should we allow to pass arbitrary object keys in search query as props into the container?
              populatedProps = pageQuery;
            }
          }
        });
        console.info('Create container with page params: ', type, userComponents, populatedProps);
        return createContainer(
          wrappedComponent,
          type,
          instance,
          containerHandlers,
          { key: key || containerKey, ...props, ...populatedProps, ...propsComponents },
          nestedComponents
        );
      }
    }
    return null;
  };

  renderPage () {
    const {
      userComponents,
      componentsTree,
      actionSequences,
      pageParams,
      pageSearch,
      populationTargets
    } = this.props;
    if (componentsTree) {
      // console.info('Render page with components tree: ', componentsTree);
      const pageQuery = queryString.parse(pageSearch);
      console.info('Page query: ', pageQuery);
      return this.renderComponent(
        userComponents,
        componentsTree,
        actionSequences,
        pageParams,
        pageQuery,
        populationTargets
      );
    }
    return (<h1>Page does not have components.</h1>);
  }

  render () {
    return this.renderPage();
  }
}

export default PageComposition;
