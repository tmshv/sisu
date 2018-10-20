import * as React from 'react';
import FileTreeNode from './components/FileTreeNode';
import TreeView from './components/TreeView';
import { ITreeNode, treeFromFlat } from './components/TreeView/lib';

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
    project: null,
  }

  public componentDidMount() {
    const projectUrl = '/project/5bcb773f989b58a5b994bd7c/info'
    const url = `http://localhost:5000${projectUrl}`

    fetch(url)
      .then(res => res.json())
      .then((data: any) => {
        this.setState({
          project: data.resource,
        })
      })
  }

  public render() {
    if (!this.state.project) {
      return null
    }

    const project: any = this.state.project
    const files: string[] = project.files;

    const tree = treeFromFlat(files)
    console.log(tree)

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">{project.name}</h1>
        </header>

        <div className="App-tree">
          <TreeView
            tree={tree}
            onClick={this.onClick}
            onFoldChange={this.onFold}
            renderNode={this.renderTreeNode}
          />
        </div>
      </div>
    );
  }

  private renderTreeNode = (node: ITreeNode, onClick: (event: Event) => void) => {
    return (
      <FileTreeNode
        node={node}
        onClick={onClick}
      />
    )
  }

  private onClick = (event: Event, n: ITreeNode) => {
    console.log(n)
  }

  private onFold = (n: ITreeNode) => {
    console.log(n)
  }
}

export default App;
