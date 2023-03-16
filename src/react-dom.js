import { createFiberRoot } from "./react-fiber";
import { ConcurrentRoot, internalContainerInstanceKey } from "./react-flags";
import { createUpdate, enqueueUpdate } from "./updateQueue";
import {
  requestEventTime,
  requestUpdateLane,
  scheduleUpdateOnFiber,
} from "./workLoop";

function updateContainer(element, container, parentComponent, callback) {
  const current = container.current; // fiber
  const eventTime = requestEventTime();
  const lane = requestUpdateLane(current);

  // const context = getContextForSubtree(parentComponent);

  const update = createUpdate(eventTime, lane); // returns an object

  update.payload = { element };
  // todo : callback
  // update.callback = callback

  const root = enqueueUpdate(container, update, lane);
  if (root !== null) {
    scheduleUpdateOnFiber(root, current, lane, eventTime);
    // entangleTransitions(root, current, lane);
  }

  return lane;
}

function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render = function (children) {
  const root = this._internalRoot;

  updateContainer(children, root, null, null);
};

const defaultOnRecoverableError =
  typeof reportError === "function"
    ? // In modern browsers, reportError will dispatch an error event,
      // emulating an uncaught JavaScript error.
      reportError
    : (error) => {
        // In older browsers and test environments, fallback to console.error.
        console["error"](error);
      };

function markContainerAsRoot(hostRootFiber, node) {
  node[internalContainerInstanceKey] = hostRootFiber;
}

function createRoot(container) {
  // todo : show error if not a valid container

  let onRecoverableError = defaultOnRecoverableError;

  const root = createFiberRoot(container, ConcurrentRoot, onRecoverableError);

  //   mark container as root
  markContainerAsRoot(root.current, container);

  // todo : listen to all supported events

  return new ReactDOMRoot(root);
}

export { createRoot };
