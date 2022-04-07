/**
 * @file dispatcher.js
 * Contains logic for the dispatcher
 */

/**
 * Emits data at the target element if available, and bubbles up from
 * the target to the parent until the document has been reached.
 * Called from the arbiter.
 * @param {Binding} binding - An object of type Binding
 * @param {Object} data - The metadata computed by the gesture being emitted.
 * @param {Array} events - An array of ZingEvents
 *  corresponding to the inputs on the screen.
 */
function dispatcher(binding, data, events) {
  data.events = events;

  const newEvent = new CustomEvent(binding.gesture.getId(), {
    detail: data,
    bubbles: true,
    cancelable: true,
  });
  emitEvent(binding.element, newEvent, binding);
}

/**
 * Emits the new event. Unbinds the event if the event was registered
 * at bindOnce.
 * @param {Element} target - Element object to emit the event to.
 * @param {Event} event - The CustomEvent to emit.
 * @param {Binding} binding - An object of type Binding
 */
function emitEvent(target, event, binding) {
  target.dispatchEvent(event);
  if (binding.bindOnce) {
    ZingTouch.unbind(binding.element, binding.gesture.getType());
  }
}

export default dispatcher;
