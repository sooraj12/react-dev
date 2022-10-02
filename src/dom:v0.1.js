const ConcurrentMode = /*                 */ 0b000001;
const HostRoot = 3;
const ClassComponent = 1;
const UpdateState = 0;

function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot;
  updateContainer(children, root, null);
};

function findCurrentUnmaskedContext(fiber) {}

function getContextForSubtree(parentComponent) {
  if (!parentComponent) {
    return {};
  }

  const fiber = parentComponent._reactInternals;
  const parentContext = findCurrentUnmaskedContext(fiber);
  return parentContext;
}

function requestEventTime() {}

function requestUpdateLane() {}

function createUpdate(eventTime, lane) {
  return {
    eventTime,
    lane,

    tag: UpdateState,
    payload: null,
    callback: null,

    next: null,
  };
}

function enqueueUpdate(fiber, update, lane) {
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) {
    return null;
  }
}

const updateContainer = (element, container, parentComponent) => {
  const current = container.current;
  const eventTime = requestEventTime();
  const lane = requestUpdateLane(current);
  const context = getContextForSubtree(parentComponent);

  if (container.context === null) {
    container.context = context;
  } else {
    container.pendingContext = context;
  }

  const update = createUpdate(eventTime, lane);

  update.payload = { element };

  const root = enqueueUpdate(current, update, lane);
  if (root !== null) {
    // scheduleUpdateOnFiber(root, current, lane, eventTime);
    // entangleTransitions(root, current, lane);
  }

  return lane;
};

function FiberRootNode(containerInfo) {
  this.containerInfo = containerInfo;
  this.current = null;

  this.context = null;
  this.pendingContext = null;
}

function FiberNode(tag, pendingProps, key, mode) {
  this.tag = tag; // HostRoot , ClassComponent
  this.key = key;
  this.stateNode = null;

  this.pendingProps = pendingProps;
  this.mode = mode; // ConcurrentMode
  this.updateQueue = null;
}

function createFiber(tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode);
}

function createRoot(container) {
  const root = new FiberRootNode(container);
  const uninitializedFiber = createFiber(HostRoot, null, null, ConcurrentMode);
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  const initialState = {
    element: null,
    isDehydrated: false,
  };

  uninitializedFiber.memoizedState = initialState;

  return new ReactDOMRoot(root);
}

export { createRoot };
