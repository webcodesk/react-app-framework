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
    pageParams: PropTypes.object,
    pageSearch: PropTypes.string,
    populationTargets: PropTypes.array,
  };

  static defaultProps = {
    userComponents: {},
    pageModels: [],
    actionSequences: {},
    targetProperties: {},
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
    targetProperties,
    pageParams,
    pageQuery,
    populationTargets
  ) {
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
          propsComponents[prop] = this.renderComponent(
            userComponents,
            value,
            actionSequences,
            targetProperties,
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
          targetProperties,
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
      let containerProperties = [];
      const propertiesObject = targetProperties[containerKey];
      if (propertiesObject) {
        containerProperties = Object.keys(propertiesObject);
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
      console.info('Create container: ', type, populatedProps);
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
    const {
      userComponents,
      pageModels,
      actionSequences,
      targetProperties,
      pageParams,
      pageSearch,
      populationTargets
    } = this.props;
    console.info('Render page with pageModels: ', pageModels);
    if (pageModels && pageModels.length > 0) {
      console.info('Render page user components: ', userComponents);
      const pageQuery = queryString.parse(pageSearch);
      console.info('Page query: ', pageQuery);
      if (pageModels.length > 1) {
        return pageModels.map((pageModel, idx) => {
          const { pageVariantName, componentsTree, mediaQuery } = pageModel;
          return (
            <Media
              key={`${pageVariantName}_${idx}`}
              query={mediaQuery}
              render={() => {
                return this.renderComponent(
                  userComponents,
                  componentsTree,
                  actionSequences,
                  targetProperties,
                  pageParams,
                  pageQuery,
                  populationTargets
                );
              }}
            />
          );
        });
      } else {
        const pageModel = pageModels[0];
        const { componentsTree } = pageModel;
        return this.renderComponent(
          userComponents,
          componentsTree,
          actionSequences,
          targetProperties,
          pageParams,
          pageQuery,
          populationTargets
        );
      }
    }
    return (<h1>Page does not have components.</h1>);
  }

  render () {
    return this.renderPage();
  }
}

export default PageComposition;
