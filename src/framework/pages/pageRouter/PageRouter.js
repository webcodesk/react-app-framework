import get from 'lodash/get';
import React from 'react';
import { Router, Switch, Route, Link } from 'react-router-dom';

import PageComposition from '../pageComposition/PageComposition';

const NoMatch = () => {
  return (
    <h1>No Match, <Link to="/">Back to home</Link></h1>
  );
};

const NoRoute = () => {
  return (<h1>Routes are missing</h1>);
};

const PageRouter = (props) => {
  const { routes, pages, userComponents, history, actionSequences } = props;
  if (!routes || routes.length === 0) {
    return (<NoRoute/>);
  }
  console.info('PageRouter history location: ', history.location);
  return (
    <Router history={history}>
      <Switch>
        {routes.map((route, index) =>
          <Route
            key={`route_${index}`}
            exact
            path={route.path}
            render={
              ({ match, location }) =>
                <PageComposition
                  userComponents={userComponents}
                  componentsTree={get(pages, route.pageName, {})}
                  actionSequences={actionSequences}
                  pageParams={match.params}
                  pageSearch={location.search}
                  populationTargets={route.populationTargets}
                />
            }
          />
        )}
        <Route component={NoMatch}/>
      </Switch>
    </Router>
  );
};

export default PageRouter;