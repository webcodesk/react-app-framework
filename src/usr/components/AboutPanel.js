import React from 'react';
import PropTypes from 'prop-types';

class AboutPanel extends React.Component {
  static propTypes = {
    authorData: PropTypes.object,
    authorDataPopulated: PropTypes.object,
    onRunMethodsChain: PropTypes.func,
  };

  static defaultProps = {
    authorDataPopulated: null,
    authorData: {
      author: 'Unknown',
      day: 'DD',
      month: 'MM',
      year: 'YYYY'
    },
    onRunMethodsChain: () => {
      console.info('AboutPanel.onRunMethodsChain is not set');
    },
  };

  constructor (props) {
    super(props);
    console.info('My props: ', this.props);
  }

  render () {
    let authorData = this.props.authorDataPopulated;
    if(!authorData || Object.keys(authorData).length === 0) {
      authorData = this.props.authorData;
    }
    const {author, day, month, year} = authorData;
    console.info('Render props: ', this.props);
    return (
      <div>
        <h1>About Panel</h1>
        <p>Author: {author}</p>
        <p>Date: {day}/{month}/{year}</p>
        <div>
          <button onClick={this.props.onRunMethodsChain}>Run methods chain</button>
        </div>
      </div>
    );
  }
}


export default AboutPanel;
