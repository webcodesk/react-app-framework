# React Application Framework for Webcodesk

When the amount of the Redux boilerplate code become critical, we lose the high-level understanding of our app. 
As our app grows, a perception which container is responsible for specific data becomes increasingly difficult. 
We have to jump back and forth between files to understand the data flow in the particular use-case.

Although, it turns out that the behavior of Redux apps can be decoupled from components, containers, or plain functions - 
places where we usually keep business logic - and can be contained and described entirely using event flows.

Such a flow can be described using JSON, and our UI can directly be driven by its description.

It does not mean that describing the logic in JSON format is easier to do or read by the human. 
Although, this approach let me built [Webcodesk](https://webcodesk.com) - a tool that makes JSON configurations on the fly and 
reduces the boilerplate code to zero.

> Be patient and read through the article to understand how react-app-framework works and what are advantages of using Webcodesk.

The best way to explain something is to provide an example. The example below is a simple proof of concept I have put together to show you how you can use the event flow description instead of writing Redux code.

Let's take a look at two different implementations of a simple use-case where the user enters its name into the input field in the form, and the header panel on the page displays greeting text with the entered name.

Both implementations use pre-created and reusable React components: `Form` and `TitlePanel`.

```javascript
import React from 'react';
import PropTypes from 'prop-types';

const rootStyle = {
  width: '150px',
  height: '150px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
};

const inputStyle = {
  padding: '5px',
  borderRadius: '4px',
  border: '1px solid #cccccc',
};

const buttonStyle = {
  padding: '5px',
  borderRadius: '4px',
};

/*
  Input form for the user name
 */

class Form extends React.Component {
  static propTypes = {
    // send the entered name
    onClick: PropTypes.func,
  };

  handleClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onClick(this.inputElement.value);
  };

  render () {
    return (
      <form onSubmit={this.handleClick}>
        <div style={rootStyle}>
          <div style={{ margin: '1em 0 1em 0' }}>
            <input
              ref={me => this.inputElement = me}
              type="text"
              placeholder="Enter your name"
              style={inputStyle}
            />
          </div>
          <div>
            <button
              type="submit"
              onClick={this.handleClick}
              style={buttonStyle}
            >
              Click
            </button>
          </div>
        </div>
      </form>
    );
  }
}

export default Form;
```

```javascript
import React from 'react';
import PropTypes from 'prop-types';
/*
  Panel with title
 */
class TitlePanel extends React.Component {
  static propTypes = {
    // simple title text
    title: PropTypes.string,
  };

  render () {
    const { title } = this.props;
    return (
      <h1 style={{ textAlign: 'center' }}>
        {title || 'Empty Title'}
      </h1>
    );
  }
}

export default TitlePanel;
```

## Example with Redux

The first implementation is a classic way to create a single page Web application with Redux.

> If you don't want to create files and write code, get the source code of the example 
from [simple_example_redux](https://github.com/ipselon/simple_example_redux)

Bootstrap the project with `create-react-app`:
```
npx create-react-app simple-example-1
```

Install Redux dependencies:
```
yarn add redux react-redux
```

Add `Form` and `TitlePanel` source code files into the `components` folder.

Here is the initial project's file structure including `Form` and `TitlePanel` components files: 
```
public/
src/
    components/
        Form.js
        TitlePanel.js
    App.js
    index.js
    index.css
    ....

```

First of all, we have to create a Redux store and wrap the root component with the `Provider` component imported from `react-redux`.

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import './index.css';
import rootReducer from './reducers';
import App from './App';

const store = createStore(rootReducer);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

Then we should create the `index` file with the root reducer in `reducers` folder in the `src` directory.

```javascript
export default (state = {}, action) => {
  switch (action.type) {
    case 'MAKE_GREETING_TEXT':
      return {
        ...state,
        greetingText: action.greetingText,
      };
    default:
      return state;
  }
};
```

Add `index.js` actions file in the `actions` folder inside the `src` directory:

```javascript
export const makeGreetingText = userName => ({
  type: 'MAKE_GREETING_TEXT',
  greetingText: `Hello, ${userName}!`
});
```

Create the `containers` folder in the `src` directory, and create there two files `FormContainer.js` and `TitleFormat.js`.

Wrap the `Form` component into its container:

```javascript
import { connect } from 'react-redux';
import { makeGreetingText } from '../actions';
import Form from '../components/Form';

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: (userName) => dispatch(makeGreetingText(userName))
});

export default connect(
  null,
  mapDispatchToProps
)(Form);
```

Wrap the `TitlePanel` component too:

```javascript
import { connect } from 'react-redux';
import TitlePanel from '../components/TitlePanel';

const mapStateToProps = (state, ownProps) => ({
  title: state.greetingText,
});

export default connect(
  mapStateToProps,
)(TitlePanel);
```

Finally, add the containers into the `App` component:

```javascript
import React, { Component } from 'react';
import TitlePanelContainer from './containers/TitlePanelContainer';
import FormContainer from './containers/FormContainer';

class App extends Component {
  render() {
    return (
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '500px', flexDirection: 'column'}}>
        <TitlePanelContainer />
        <FormContainer />
      </div>
    );
  }
}

export default App;
```

Now you can run the dev server and try application:
```
yarn start
```

## Example with React App Framework

The second example uses `create-react-app` to bootstrap the project, 
but with the modified `react-scripts`.

> If you don't want to create files and write code, get the source code of the example 
from [simple-example-react-app-framework](https://github.com/ipselon/simple-example-react-app-framework)

Bootstrap the project with the command:
```
npx create-react-app --scripts-version @webcodesk/react-scripts simple-example-2
```

The structure of the source code, in this case, is a bit different from what `create-react-app` generated before.

File structure:
```
public/
src/
    app/
    etc/
    usr/
    index.css
    index.js

```

Where:

* `app` - a directory that `react-app-framework` uses for component index files, Redux storage config, page and routes configuration.
* `etc` - a directory with configuration files for Webcodesk, we don't use it now, because we are going to do everything manually.
* `usr` - a directory, where we keep our source code.

Add `Form` and `TitlePanel` source code into the `components` folder in `src/usr` directory.
```
src/
    usr/
        components/
            Form.js
            TitlePanel.js

```

First, we should add our components into index files in the `app` directory.

Go to the `src/app/indices/userComponents/usr` directory and create there the `components` folder:
```
src/app/indices/userComponents/usr/components
```

Then create the `index.js` file inside this folder, and add the following lines:

```javascript
import Form from 'usr/components/Form';
import TitlePanel from 'usr/components/TitlePanel';

export default { Form, TitlePanel };
```

Then add import into the index file in the parent directory (`src/app/indices/userComponents/usr`):

```javascript
import components from './components';
export default {components};
```

Doing this we set up index files that tell `react-app-framework` where the React components are.

Now we should add components into the `main` page. 
There is already a configuration for the `main` page in the `src/app/schema/pages` folder.

Open the `main.js` file there and add the following code into it:

```javascript
export default {
  type: '_div',
  props: {
    style: {
      width: '100%',
      height: '500px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }
  },
  children: [
    {
      type: 'usr.components.TitlePanel',
      instance: 'titlePanel',
    },
    {
      type: 'usr.components.Form',
      instance: 'form',
    }
  ]
};
```

This code tells to create a `div` element with two children: `usr.components.TitlePanel` and `usr.components.Form`

Please note, that we specify kind of the full path to each component in the `type` field. 
Also, there is an `instance` field that used to indicate the instance of the React component in the application.

> Think of the component's instance as an object initialized in the memory. 
There may be multiple instances of the React component with different names.

However, for now, remember the instances names because we use them in the flow configuration.

Once we've changed the page config, we should create a function that is responsible for making greeting text.

Create the `actions.js` file in the `src/usr/api` folder and add the following code there:

```javascript
export const makeGreetingText = (userName) => (dispatch) => {
  dispatch('greeting', userName ? `Hello, ${userName} !!!` : 'Hello, Noname !!!');
};
```

As you might notice, the function is a chained function. 
This is done intentionally because the framework recognizes only such syntax of the function.

Another feature of the function is a `dispatch` argument in the second function in the chain. 
The `dispatch` is a callback method which is injected by the framework during the function execution. 

The first argument of the callback is the identification for the object which is passed in as the second argument. 
This is similar to the action type in action creators in Redux.

> Remember the name of the `greeting` dispatch - we use it in the flow configuration.

The function in `react-app-framework` is considered as a decoupled and independent component too. 
That's why we have to add the function into index files in the `src/app` directory in order the framework finds the function.

Go to the `src/app/userFunctions/usr` directory and 
create there new `api` folder. Then create the `index.js` file inside:

```javascript
import { makeGreetingText } from 'usr/api/actions';
export default {makeGreetingText}
```

And import this file in the `index.js` file in the parent directory (`src/app/userFunctions/usr`):

```javascript
import api from './api';
export default {api};
```

> There is no requirements for the structure of index files, 
but we are using nested folders for indexes to show how it should be in the real 
application when there are a lot of components.

It's time to add the last piece of the application - a flow. 

The flow is a description that shows how components, functions, and pages are connected in the application.

> You can think about the flow as the configuration of a use-case that should be implemented.

> You may have a lot of use-cases in the real-world application. However, feel free to create any amount of the different flows in the application. 
Even though you have to implement almost equal data flows with slightly different scenarios, 
and with the same elements, `react-app-framework` reconciles all flows in one big flow where equal parts are merged. 
Many separate flows that describe different use cases give you the ability to easily modify different parts of overall 
application logic.

Find the `start.js` file in `src/app/schema/flows` directory. 
This is a sample flow config which we should replace with our configuration.

Replace the file content with the following code:

```javascript
export default [{
  type: 'component',
  props: { 'componentName': 'usr.components.Form', 'componentInstance': 'form' },
  events: [{
    name: 'onClick',
    targets: [{
      type: 'userFunction',
      props: { 'functionName': 'usr.api.makeGreetingText' },
      events: [{
        name: 'greeting',
        targets: [{
          type: 'component',
          props: {
            componentName: 'usr.components.TitlePanel',
            componentInstance: 'titlePanel',
            propertyName: 'title'
          }
        }]
      }]
    }]
  }]
}];
```

Where:

* `type` - the type of the section in the flow chain. It can be `component` or `userFunction`

* `props` - the arbitrary information about the section. 

> For example, there are ` componentName`, `componentInstance` in case of the section has `component` type.

* `events` - the list of events that fire in the component instance or in function during the flow execution. 

> When the section is `component` the events are taken from the PropTypes descriptions in the compoent's source code. 
However, in the case of `userFunction` the events are any of `dispatch` mentioned in the function source code.

* `name` - the event name by component's function property or dispatch name.

* `targets` - a list of the component instances or functions that receive data produced by the parent event. 

> Target component should have the `propertyName` in the `props` description to specify what property receives the data.

Please note, component's events and function's dispatches produce only the first argument. 

> For example, in `dispatch('greeting', someText, anotherText)` - `anotherText` will not be passed in the target property.

Once we've added all configurations, we can start the development server:
```
yarn start
```

## Conclusion

There are no advantages of using `react-app-framework` because you should add configurations in different files manually, 
that leads to the same jumping back and forth between files as in the case of creating 
Redux actions, constants, reducers, etc.

But...

There is [Webcodesk](https://webcodesk.com) - a visual tool that uses `react-app-framework` to build Web applications. 
Webcodesk creates all the necessary configs in the project automatically. 
The only thing you have to do is to drag and drop components into the pages and draw visual flow in the flow editor.

Go to through [the beginner tutorial](https://webcodesk.com/documentation) where you can create a real-world application in Webcodesk.


 
