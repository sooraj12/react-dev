import {
  ConcurrentMode,
  ConcurrentRoot,
  HostRoot,
  NoLanes,
  NoMode,
} from "./react-flags";
import { initializeUpdateQueue } from "./updateQueue";

const TotalLanes = 31;

function createLaneMap(initial) {
  const laneMap = [];
  for (let i = 0; i < TotalLanes; i++) {
    laneMap.push(initial);
  }
  return laneMap;
}

function FiberRootNode(container, tag, onRecoverableError) {
  this.containerInfo = container;
  this.tag = tag;
  this.onRecoverableError = onRecoverableError;
  this.current = null;

  this.pendingLanes = NoLanes;
  this.suspendedLanes = NoLanes;
  this.pingedLanes = NoLanes;
  this.eventTimes = createLaneMap(NoLanes);
}

function FiberNode(tag, pendingProps, key, mode) {
  this.tag = tag;
  this.key = key;
  this.mode = mode;
  this.pendingProps = pendingProps;

  this.stateNode = null;
  this.memoizedState = null;
  this.updateQueue = null;

  this.alternate = null;
  this.lanes = NoLanes;

  this.return = null;
}

function createFiber(tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode);
}

function createHostRootFiber(tag) {
  let mode;
  if (tag === ConcurrentRoot) {
    mode = ConcurrentMode;
  } else {
    mode = NoMode;
  }
  return createFiber(HostRoot, null, null, mode);
}

function createFiberRoot(container, tag, onRecoverableError) {
  const root = new FiberRootNode(container, tag, onRecoverableError);

  const uninitializedFiber = createHostRootFiber(tag);
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  const initialState = {
    element: null,
    isDehydrated: false,
  };

  uninitializedFiber.memoizedState = initialState;
  initializeUpdateQueue(uninitializedFiber);

  return root;
}

export { createFiberRoot };
