import React from 'react';
import { Router, Switch, Route, Link } from 'react-router-dom';
import { createActionSequences } from '../store/sequences';

import PageComposition from './pageComposition';

const NoMatch = () => {
  return (
    <h1>No Match, <Link to="/">Back to home</Link></h1>
  )
};

const NoRoute = () => {
  return (<h1>Routes are missing</h1>);
};

const PageRouter = (props) => {
  const {routes, pages, flows, userComponents, userFunctions, history} = props;
  if (!routes || routes.length === 0) {
    return (<NoRoute />);
  }
  console.info('PageRouter history location: ', history.location);
  const actionSequences = createActionSequences(flows, userFunctions);
  return (
      <Router history={history}>
        <Switch>
          {routes.map((route, index) =>
            <Route
              key={`route_${index}`}
              exact
              path={route.path}
              render={
                ({match, location}) =>
                  <PageComposition
                    userComponents={userComponents}
                    pageName={route.pageName}
                    pages={pages}
                    actionSequences={actionSequences}
                    pageParams={match.params}
                    pageSearch={location.search}
                    populationTargets={route.populationTargets}
                  />
              }
            />
          )}
          <Route component={NoMatch} />
        </Switch>
      </Router>
  )
};

export default PageRouter;