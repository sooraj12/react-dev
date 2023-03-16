const REACT_ELEMENT_TYPE = Symbol.for("react.element");
const __DEV__ = false;
const randomKey = Math.random().toString(36).slice(2);
const internalContainerInstanceKey = "__reactContainer$" + randomKey;

const ConcurrentRoot = 1;
const HostRoot = 3;

// types
const NoMode = 0b000000;
const ConcurrentMode = 0b000001;

// lanes
const NoLanes = 0b0000000000000000000000000000000;
const IdleLane = 0b0100000000000000000000000000000;

export {
  REACT_ELEMENT_TYPE,
  __DEV__,
  ConcurrentRoot,
  NoMode,
  HostRoot,
  ConcurrentMode,
  NoLanes,
  internalContainerInstanceKey,
  IdleLane,
};
