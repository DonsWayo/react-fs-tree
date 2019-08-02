import React from 'react'
import FSRoot from 'react-fs-tree'

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <FSRoot children={[
          { name: 'file' },
          { name: 'added file', mode: 'a' },
          { name: 'deleted file', mode: 'd' },
          { name: 'modified file', mode: 'm' },
          { name: 'folder', children: [
            { name: 'foo' },
            { name: 'bar' },
            { name: 'baz' },
          ] },
        ]} />
      </div>
    )
  }
}

export default App
