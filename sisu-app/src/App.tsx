import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { getRequest } from './api';
import PageHome from './components/PageHome';
import PageLogin from './components/PageLogin';
import PageProject from './components/PageProject';
import { UserContext } from './context';

import './App.css';

interface IState {
  init: boolean;
  user: any;
}

class App extends React.Component<{}, IState, any> {
  public state = {
    init: false,
    user: null,
  }

  public componentDidMount() {
    getRequest('/user')
      .then(res => {
        if (res.status !== 200) {
          throw new Error("User no authorized");
        }

        return res.json()
      })
      .then(res => {
        this.setState({
          init: true,
          user: res.resource,
        });
      })
      .catch(err => {
        this.setState({
          init: true,
        });
      })
  }

  public render() {
    if (!this.state.init) {
      return null;
    }

    return (
      <UserContext.Provider value={{
        user: this.state.user,
      }}>
        <Router>
          <div className={"App"}>
            <Route exact={true} path="/" component={PageHome} />
            <Route path="/login" component={PageLogin} />
            <Route path="/project/:id" component={PageProject} />
          </div>
        </Router>
      </UserContext.Provider>
    );
  }
}

export default App;
