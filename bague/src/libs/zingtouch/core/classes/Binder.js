/**
 * @file Binder.js
 */

/**
 * A chainable object that contains a single element to be bound upon.
 * Called from ZingTouch.bind(), and is used to chain over gesture callbacks.
 * @class
 */
class Binder {
  /**
   * Constructor function for the Binder class.
   * @param {Element} element - The element to bind gestures to.
   * @param {Boolean} bindOnce - Option to bind once and only emit
   * the event once.
   * @param {Object} state - The state of the Region that is being bound to.
   * @return {Object} - Returns 'this' to be chained over and over again.
   */
  constructor(element, bindOnce, state) {
    /**
     * The element to bind gestures to.
     * @type {Element}
     */
    this.element = element;

    Object.keys(state.registeredGestures).forEach((key) => {
      this[key] = (handler, capture) => {
        state.addBinding(this.element, key, handler, capture, bindOnce);
        return this;
      };
    });
  }

}

export default Binder;
