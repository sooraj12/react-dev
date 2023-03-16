import Scheduler from "scheduler";
import { ConcurrentMode, IdleLane, NoLanes, NoMode } from "./react-flags";

const NoTimestamp = -1;
const NoContext = 0b000;
const RenderContext = 0b010;
const CommitContext = 0b100;
const now = Scheduler.unstable_now;

let executionContext = NoContext;
let currentEventTime = NoTimestamp;
let workInProgressRoot = null;

function requestEventTime() {
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
    // we're inside react, so it's fine to read the actual time
    return now();
  }

  // we're not inside react, so we maybe in the middle of a browser event
  if (currentEventTime !== NoTimestamp) {
    // use same start time for all updates until we enter react again
    return currentEventTime;
  }

  // this is the first update since react yielded. compute a new start time
  currentEventTime = now();
  return currentEventTime;
}

function requestUpdateLane(fiber) {}

function isUnsafeClassRenderPhaseUpdate(fiber) {
  return (
    (fiber.mode & ConcurrentMode) === NoMode &&
    (executionContext & RenderContext) !== NoContext
  );
}

function scheduleUpdateOnFiber(root, fiber, lane, eventTime) {
  // mark that the root has a pending update
  markRootUpdated(root, lane, eventTime);

  if (
    (executionContext & RenderContext) !== NoLanes &&
    root === workInProgressRoot
  ) {
  } else {
  }
}

function pickArbitraryLaneIndex(lanes) {
  return 31 - Math.clz32(lanes);
}

function laneToIndex(lane) {
  return pickArbitraryLaneIndex(lane);
}

function markRootUpdated(root, updateLane, eventTime) {
  root.pendingLanes |= updateLane;

  if (updateLane !== IdleLane) {
    root.suspendedLanes = NoLanes;
    root.pingedLanes = NoLanes;
  }

  const eventTimes = root.eventTimes;
  const index = laneToIndex(updateLane);
  // We can always overwrite an existing timestamp because we prefer the most
  // recent event, and we assume time is monotonically increasing.
  eventTimes[index] = eventTime;
}

export {
  requestEventTime,
  requestUpdateLane,
  isUnsafeClassRenderPhaseUpdate,
  scheduleUpdateOnFiber,
};
