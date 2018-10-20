import * as React from 'react';
import TreeView from './components/TreeView';
import { ITreeNode, treeFromFlat } from './components/TreeView/lib';
import logo from './logo.svg';

import './App.css';

// const tree = node('', [
//   node('1', [
//     node('4', []),
//     node('5', []),
//     node('6', []),
//   ]),
//   node('2', [
//     node('7', []),
//     node('8', [
//       node('9', []),
//     ]),
//   ]),
//   node('3', []),
// ])

class App extends React.Component {
  public state = {
    data: null,
  }

  public componentDidMount(){
    fetch('/data.json')
      .then(res => res.json())
      .then((data: any) => {
        this.setState({
          data,
        })
      })
  }

  public render() {
    if(!this.state.data){
      return null
    }

    const data: any = this.state.data

    const tree = treeFromFlat(data.files)
    console.log(tree)

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>

        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>

        <div className="App-tree">
          <TreeView
            tree={tree}
            onClick={this.onClick}
            onFoldChange={this.onFold}
          />
        </div>
      </div>
    );
  }

  private onClick = (event: Event, n: ITreeNode) => {
    console.log(n)
  }

  private onFold = (n: ITreeNode) => {
    console.log(n)
  }
}

export default App;
