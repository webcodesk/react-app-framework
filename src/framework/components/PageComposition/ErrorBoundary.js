import React from 'react';

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidCatch (error, info) {
    this.setState({ hasError: true, error });
  }

  render () {
    const {hasError, error} = this.state;
    if (hasError) {
      const { pageName } = this.props;
      return (
        <div style={{color: 'white', backgroundColor: 'red', borderRadius: '4px', padding: '.5em'}}>
          <code>Error occurred in "{pageName}" page: </code>
          <code>{error && error.message}</code>
        </div>
      );
    }
    return this.props.children;
  }
}
