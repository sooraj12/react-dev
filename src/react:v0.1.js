function createElement(type, config, children) {
  let props = Object.assign({}, config);

  let childCount = arguments.length - 2;
  if (childCount === 1) {
    props.children = children;
  } else if (childCount > 1) {
    props.children = [].slice.call(arguments, 2);
  }

  return { type, props };
}

const ROOT_KEY = "testroot";
const instanceById = {};
let rootId = 1;

function isRoot(node) {
  if (node.dataset[ROOT_KEY]) {
    return true;
  }

  return false;
}

function render(element, node) {
  // assert(Element.isValidElement(element));

  // First check if we have already rendered in to
  // this node. if so, this is an update.
  // otherwise this is an initial render
  if (isRoot(node)) {
    update(element, node);
  } else {
    mount(element, node);
  }
}

function mount(element, node) {
  // create the internal instance , this abstracts
  // away the different component types
  let component = intantiateComponent(element);

  // store this for later updates and unmounting
  instanceById[rootId] = component;

  // mounting generates dom nodes. this is where
  // react determines if we're remounting
  // server-rendered content
  let renderedNode = Reconciler.mountComponent(component, node);

  // do some dom operations, making this node as a
  // root, and inserting the new dom as a child
  node.dateset[ROOT_KEY] = rootId;
  DOM.empty(node);
  DOM.appendChild(node, renderedNode);
  rootId++;
}

function update(element, node) {
  // find the internal instance and update it
  let id = node.dataset[ROOT_KEY];
  let instance = instanceById[id];

  let prevElem = instance._currentElem;
  if (shouldUpdateComponent(prevElem, element)) {
    // send the new element to the instance
    Reconciler.receiveComponent(instance, element);
  } else {
    // un mount and then mount the new one
    unmountComponentAtnode(node);
    mount(element, node);
  }
}

// this determines if we are going to end up
// reusing an internal instance or not. this is
// one of the big shortcuts that react does.
// stopping us from instantiating and comparing
// full trees. instead we immediatedly throw away
// a sub tree when updating from one element type
// to another.
function shouldUpdateComponent(prevElem, nextElem) {
  // simply use element.type
  // 'div' !== 'span'
  // in react we would also look at the key
  return prevElem.type === nextElem.type;
}

const Reconciler = {
  mountComponent: (component) => {
    // this will generate the dom node that will go
    // into the dom. we defer to the component
    // instance since it will contain the renderer
    // specific implementation of what that means.
    // this allows the reconciler to be reused
    // across dom & native
    let markup = component.mountComponent();

    // react does more work here to ensure that
    // refs work.
    return markup;
  },
  receiveComponent: (component, element) => {
    // shortcut! we don't do anything if the next
    // element is the same as the current one. this
    // is unlikely in normal jsx usage, but at an
    // optimization that can be unlocked with babels
    // inline-element transform.
    let prevElem = component._currentElem;
    if (prevElem === element) {
      return;
    }

    // defer to the instance.
    component.receiveComponent(element);
  },
  performUpdateIfNecessary: () => {},
};

class Component {
  constructor(props) {
    this.props = props;
    this._currentElem = null;
    this._pendingState = null;
    this._renderedComponent = null;
    this._renderedNode = null;
  }

  setState(partialState) {
    // react uses a queue here to allow batching.
    this._pendingState = Object.assign({}, this.state, partialState);
    Reconciler.performUpdateIfNecessary(this);
  }

  // we have a helper method here to avoid having
  // a wrapper instance. react does this - it's a
  // smarter implementation and hides required
  // helpers , internal data. that also allows
  // renderers to have their own implementation
  // specific wrappers. this ensures that
  // React.Component is available on native
  _constructor(element) {
    this._currentElem = element;
  }

  mountComponent() {
    // we call the render method to get our actual
    // rendered element. Note : since react
    // doesn't support arrays or other types, we can
    // safely assume we have an element
    let renderedElement = this.render();

    // TODO : call componentWillMount

    // actually instantiate the rendered element
    let component = intantiateComponent(renderedElement);
    this._renderedComponent = component;

    // generate markup for component & recurse
    // since composite components instances don't
    // have a dom representation of their own,
    // this markup will actually be the dom nodes
    // (or native views)
    let renderedNode = Reconciler.mountComponent(component, node);
    return renderedNode;
  }

  receiveComponent(nextElem) {
    this.updateComponent(nextElem);
  }

  updateComponent(nextElem) {
    let prevElem = this._currentElem;

    // when just updating state, nextElem
    // will be the same as the previously rendered
    // element. otherwise, this update is the
    // result of a parent re-rendering
    if (prevElem !== nextElem) {
      // TODO : call componentWillRecieiveProps
    }

    // TODO : call shouldComponentUpdate and
    // return if false

    // TODO : call componentWillUpdate

    // update instance data
    this._currentElem = nextElem;
    this.props = nextElem.props;
    if (this._pendingState) {
      this.state = this._pendingState;
    }
    this._pendingState = null;

    // we need the previously rendered element
    // (render() result) to compare to the next
    // render() result
    let prevRenderedElem = this._renderedComponent._currentElem;
    let nextRenderedElem = this.render();

    // just like a top level update, determine if
    // we should update or replate
    if (shouldUpdateComponent(prevRenderedElem, nextRenderedElem)) {
      Reconciler.receiveComponent(this._renderedComponent, nextRenderedElem);
    } else {
      // un mount the current component and
      // instantiate the new one, replace the
      // content in the dom
      Reconciler.unmountComponent(this._renderedComponent);
      let nextRenderedComponent = instantiateComponent(nextRenderedElem);
      let nextMarkup = Reconciler.mountComponent(nextRenderedComponent);
      DOM.replaceNode(this._renderedComponent._domNode, nextMarkup);
      this._renderedComponent = nextRenderedComponent;
    }
  }
}

class MultiChild {}

class DomComponentWrapper extends MultiChild {
  constructor(element) {
    super();
    this._currentElem = element;
    this._domNode = null;
  }

  mountComponent() {
    // create the dom element, set attributes,
    // recurse for children
    let el = document.createElement(this._currentElem.type);
    this._domNode = el;
    this._updateDomProperties({}, this._currentElem.props);
    this._createInitialDomChildren(this._currentElem.props);
    return el;
  }
}

export { render, createElement, Component };
