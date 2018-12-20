import queryString from 'query-string';
import forOwn from 'lodash/forOwn';
import uniqueId from 'lodash/uniqueId';
import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Media from 'react-media';
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
    pageModels: PropTypes.array,
    actionSequences: PropTypes.object,
    targetProperties: PropTypes.object,
    routePath: PropTypes.string,
    pageParams: PropTypes.object,
    pageSearch: PropTypes.string,
    populationTargets: PropTypes.array,
  };

  static defaultProps = {
    userComponents: {},
    pageModels: [],
    actionSequences: {},
    targetProperties: {},
    routePath: '',
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
    description,
  ) {
    const {
      userComponents,
      actionSequences,
      targetProperties,
      routePath,
      pageParams,
      pageSearch,
      populationTargets
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
      const pageComponent = pageComponents[pageComponentType];
      return React.createElement(
        pageComponent || pageComponentType,
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
      const actionSequence = actionSequences[containerKey];
      if (actionSequence) {
        containerHandlers = actionSequence.events;
      }
      let populatedProps = {};
      let containerProperties = [];
      const propertiesObject = targetProperties[containerKey];
      const parameterValue = pageParams ? pageParams['parameter'] : null;
      const normalizedRoutePath = routePath.substr(1).replace('/:parameter?', '');
      if (propertiesObject) {
        containerProperties = Object.keys(propertiesObject);
        forOwn(propertiesObject, (value, key) => {
          if (value && value.forwardPath === normalizedRoutePath) {
            populatedProps[key] = parameterValue || pageQuery;
          }
        });
      }
      console.info('[Framework] Create container: ', {
        componentName: type,
        componentInstance: instance
      });
      return createContainer(
        wrappedComponent,
        type,
        instance,
        containerHandlers,
        containerProperties,
        { key: key || containerKey, ...props, ...populatedProps, ...propsComponents },
        nestedComponents
      );
    }
  };

  renderPage () {
    const {pageModels} = this.props;
    if (pageModels && pageModels.length > 0) {
      if (pageModels.length > 1) {
        return pageModels.map((pageModel, idx) => {
          const { pageVariantName, componentsTree, mediaQuery } = pageModel;
          return (
            <Media
              key={`${pageVariantName}_${idx}`}
              query={mediaQuery}
              render={() => {
                return this.renderComponent(componentsTree);
              }}
            />
          );
        });
      } else {
        const pageModel = pageModels[0];
        const { componentsTree } = pageModel;
        return this.renderComponent(componentsTree);
      }
    }
    return (<h1>Page does not have components.</h1>);
  }

  render () {
    return this.renderPage();
  }
}

export default PageComposition;
