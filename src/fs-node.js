import PropTypes from 'prop-types'
import React from 'react'

import Icons from './icons'
import { exports } from './module'
import Shapes from './shapes'

class FSNode extends React.Component {
  static propTypes = {
    node: Shapes.Node.isRequired,
    branch: PropTypes.instanceOf(React.Component).isRequired,
    parentNode: PropTypes.instanceOf(React.Component).isRequired,
    root: PropTypes.instanceOf(React.Component).isRequired,
    depth: PropTypes.number,
    virtual: PropTypes.bool,
    noninteractive: PropTypes.bool,
    onSelect: PropTypes.func,
    onDeselect: PropTypes.func,
    onSelectChange: PropTypes.func,
    onClose: PropTypes.func,
    onOpen: PropTypes.func,
    onOpenChange: PropTypes.func,
  }

  static defaultProps = {
    depth: 0,
    virtual: false,
    noninteractive: false,
    onSelect: () => {},
    onDeselect: () => {},
    onSelectChange: () => {},
    onClose: () => {},
    onOpen: () => {},
    onOpenChange: () => {},
  }

  get depth() {
    return this.props.depth
  }

  get virtual() {
    return this.props.virtual
  }

  get parentNode() {
    return this.props.parentNode
  }

  get root() {
    return this.props.root
  }

  get noninteractive() {
    return this.props.noninteractive
  }

  get children() {
    return [...this._children]
  }

  get branchedOut() {
    return !!this.state.node.children
  }

  get path() {
    return this._path
  }

  get name() {
    return this.state.node.name
  }

  get opened() {
    return this.state.node.opened
  }

  get selected() {
    return this.state.node.selected
  }

  constructor(props) {
    super(props)

    this._path = props.branch._path + props.node.name
    this._children = []

    this.state = {
      node: props.node
    }

    if (props.virtual) {
      this._createVirtualchildren()
    }
  }

  componentDidMount() {
    this._mounted = true
  }

  componentWillUpdate() {
    this._children = []
  }

  componentDidUpdate() {
    if (!this.state.opened) {
      this._createVirtualchildren()
    }
  }

  componentWillUnmount() {
    this._mounted = false
  }

  render() {
    return (
      <div className="FSNode">
        <div className={this._getWrapClass()} style={this._getWrapStyle()}>
          <div className="FSNode-node" style={this._getNodeStyle()}>
            <div className="FSNode-descriptor">
              <div className="FSNode-icon" onClick={!this.props.noninteractive && (() => this.toggleOpen())}>{this._getIcon()}</div>
              <div className="FSNode-text" onClick={!this.props.noninteractive && (() => this.toggleSelect())}>{this.state.node.name}</div>
            </div>
            {this.state.node.children && this.state.node.opened && (
              <exports.FSBranch
                ref={ref => ref && (this._children = ref._children)}
                children={this.state.node.children}
                parentNode={this}
                root={this.props.root}
                depth={this.props.depth}
                noninteractive={this.props.noninteractive}
                onSelect={this.props.onSelect}
                onDeselect={this.props.onDeselect}
                onSelectChange={this.props.onSelectChange}
                onOpen={this.props.onOpen}
                onClose={this.props.onClose}
                onOpenChange={this.props.onOpenChange}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  select(onSelect = () => {}) {
    const callback = (resolve = Promise.resolve.bind(Promise)) => {
      this.props.onSelect(this)
      this.props.onSelectChange(this)
      onSelect(this)

      return resolve(this)
    }

    if (this.state.node.selected) return callback()

    if (!this._mounted) {
      const node = this.state.node
      node.selected = true

      return callback()
    }

    return new Promise((resolve) => {
      this.setState({
        node: Object.assign(this.state.node, {
          selected: true
        })
      }, () => {
        callback(resolve)
      })
    })
  }

  deselect(onDeselect = () => {}) {
    const callback = (resolve = Promise.resolve.bind(Promise)) => {
      this.props.onDeselect(this)
      this.props.onSelectChange(this)
      onDeselect(this)

      return resolve(this)
    }

    if (!this.state.node.selected) return callback()

    if (!this._mounted) {
      const node = this.state.node
      node.selected = false

      return callback()
    }

    return new Promise((resolve) => {
      this.setState({
        node: Object.assign(this.state.node, {
          selected: false
        })
      }, () => {
        callback(resolve)
      })
    })
  }

  toggleSelect(onToggle) {
    return this.state.node.selected ? this.deselect(onToggle) : this.select(onToggle)
  }

  close(onClose = () => {}) {
    const callback = (resolve = Promise.resolve.bind(Promise)) => {
      this.props.onClose(this)
      this.props.onOpenChange(this)
      onClose(this)

      return resolve(this)
    }

    if (!this.state.node.children) return callback()
    if (!this.state.node.opened) return callback()

    return new Promise((resolve) => {
      this.setState({
        node: Object.assign(this.state.node, {
          opened: false
        })
      }, () => {
        callback(resolve)
      })
    })
  }

  open(onOpen = () => {}) {
    const callback = (resolve = Promise.resolve.bind(Promise)) => {
      this.props.onOpen(this)
      this.props.onOpenChange(this)
      onOpen(this)

      return resolve(this)
    }

    if (!this.state.node.children) return callback()
    if (this.state.node.opened) return callback()

    return new Promise((resolve) => {
      this.setState({
        node: Object.assign(this.state.node, {
          opened: true
        })
      }, () => {
        callback(resolve)
      })
    })
  }

  toggleOpen(onToggle) {
    return this.state.node.opened ? this.close(onToggle) : this.open(onToggle)
  }

  _getWrapClass = () => {
    const selected = this.state.node.selected ? 'FSNode-selected' : 'FSNode-deselected'

    return `FSNode-wrap ${selected}`
  }

  _getDepthSize = (depth = this.depth) => {
    let padding = 23 * depth

    if (!this.state.node.children) {
      padding += 14
    }

    return padding + 'px'
  }

  _getWrapStyle = () => {
    const translateX = this._getDepthSize(this.depth - 1)

    return {
      transform: `translateX(-${translateX})`,
      width: `calc(100% + ${translateX})`,
    }
  }

  _getNodeStyle = () => {
    return {
      paddingLeft: this._getDepthSize(this.depth),
      zIndex: this.depth,
    }
  }

  _getIcon = () => {
    if (!this.state.node.children) {
      switch (this.state.node.mode) {
        case 'a': return (
          <span onClick={!this.props.noninteractive && (() => this.toggleSelect())}>
            <span className='FSNode-mode FSNode-mode-a'>A</span>
            <Icons.File />
          </span>
        )
        case 'd': return (
          <span onClick={!this.props.noninteractive && (() => this.toggleSelect())}>
            <span className='FSNode-mode FSNode-mode-d'>D</span>
            <Icons.File />
          </span>
        )
        case 'm': return (
          <span onClick={!this.props.noninteractive && (() => this.toggleSelect())}>
            <span className='FSNode-mode FSNode-mode-m'>M</span>
            <Icons.File />
          </span>
        )
        default: return <Icons.File onClick={!this.props.noninteractive && (() => this.toggleSelect())}/>
      }
    }

    return !this.state.node.opened ? (
      <span>
        <Icons.CaretRight />
        <Icons.Folder />
      </span>
    ) : (
      <span>
        <Icons.CaretDown />
        <Icons.FolderOpen />
      </span>
    )
  }

  _createVirtualchildren() {
    if (!this.state.node.children) return

    this.state.node.children.forEach((node) => {
      const ref = new FSNode({
        node,
        virtual: true,
        branch: this.props.branch,
        parentNode: this,
        root: this.props.root,
        depth: this.props.depth + 1,
        noninteractive: this.props.noninteractive,
        onSelect: this.props.onSelect,
        onDeselect: this.props.onDeselect,
        onSelectChange: this.props.onSelectChange,
        onOpen: this.props.onOpen,
        onClose: this.props.onClose,
        onOpenChange: this.props.onOpenChange,
      })

      this._children.push(ref)
    })
  }
}

exports.FSNode = FSNode
