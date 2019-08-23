/**
 * @fileoverview
 * Contains types and objects necessary for Soy-Idom runtime.
 */
goog.module('google3.javascript.template.soy.element_lib_idom');
var module = module || { id: 'javascript/template/soy/element_lib_idom.js' };
var tsickle_module_1_ = goog.require('google3.javascript.template.soy.skiphandler');
var goog_goog_asserts_1 = goog.require('goog.asserts'); // from //javascript/closure/asserts
var incrementaldom = goog.require('google3.third_party.javascript.incremental_dom.index'); // from //third_party/javascript/incremental_dom:incrementaldom
var api_idom_1 = goog.require('google3.javascript.template.soy.api_idom');
var global_1 = goog.require('google3.javascript.template.soy.global');
/**  Getter for skip handler */
function getSkipHandler(el) {
  return el.__soy_skip_handler;
}
/** Base class for a Soy element. */
var SoyElement = /** @class */ (function () {
  function SoyElement(data, ijData) {
    this.data = data;
    this.ijData = ijData;
    // Node in which this object is stashed.
    this.node = null;
    this.skipHandler = null;
    this.syncState = true;
    // Marker so that future element accesses can find this Soy element from the
    // DOM
    this.key = '';
  }
  /**
   * State variables that are derived from parameters will continue to be
   * derived until this method is called.
   */
  SoyElement.prototype.setSyncState = function (syncState) {
    this.syncState = syncState;
  };
  SoyElement.prototype.shouldSyncState = function () {
    return this.syncState;
  };
  /**
   * Patches the current dom node.
   * @param renderer Allows injecting a subclass of IncrementalDomRenderer
   *                 to customize the behavior of patches.
   */
  SoyElement.prototype.render = function (renderer) {
    var _this = this;
    if (renderer === void 0) { renderer = new api_idom_1.IncrementalDomRenderer(); }
    goog_goog_asserts_1.assert(this.node);
    // It is possible that this Soy element has a skip handler on it. When
    // render() is called, ignore the skip handler.
    var skipHandler = this.skipHandler;
    this.skipHandler = null;
    api_idom_1.patchOuter(this.node, function () {
      // If there are parameters, they must already be specified.
      _this.renderInternal(renderer, _this.data);
    });
    this.skipHandler = skipHandler;
  };
  /**
   * Replaces the next open call such that it executes Soy element runtime
   * and then replaces itself with the old variant. This relies on compile
   * time validation that the Soy element contains a single open/close tag.
   */
  SoyElement.prototype.queueSoyElement = function (renderer, data) {
    var _this = this;
    var oldOpen = renderer.open;
    renderer.open = function (nameOrCtor, key) {
      if (key === void 0) { key = ''; }
      var el = incrementaldom.open(nameOrCtor, renderer.getNewKey(key));
      renderer.open = oldOpen;
      var maybeSkip = _this.handleSoyElementRuntime(el, data);
      if (!maybeSkip) {
        renderer.visit(el);
        return el;
      }
      // This token is passed to ./api_idom.maybeSkip to indicate skipping.
      return api_idom_1.SKIP_TOKEN;
    };
  };
  /**
   * Handles synchronization between the Soy element stashed in the DOM and
   * new data to decide if skipping should happen. Invoked when rendering the
   * open element of a template.
   */
  SoyElement.prototype.handleSoyElementRuntime = function (node, data) {
    if (!node) {
      return false;
    }
    this.node = node;
    node.__soy = this;
    var newNode = new this.constructor(data);
    // Users may configure a skip handler to avoid patching DOM in certain
    // cases.
    var maybeSkipHandler = getSkipHandler(node);
    if (this.skipHandler || maybeSkipHandler) {
      goog_goog_asserts_1.assert(!this.skipHandler || !maybeSkipHandler, 'Do not set skip handlers twice.');
      var skipHandler = this.skipHandler || maybeSkipHandler;
      if (skipHandler(this, newNode)) {
        return true;
      }
    }
    // For server-side rehydration, it is only necessary to execute idom to
    // this point.
    if (global_1.isTaggedForSkip(node)) {
      return true;
    }
    this.data = newNode.data;
    return false;
  };
  SoyElement.prototype.setSkipHandler = function (skipHandler) {
    goog_goog_asserts_1.assert(!this.skipHandler, 'Only one skip handler is allowed.');
    this.skipHandler = skipHandler;
  };
  return SoyElement;
}());
exports.SoyElement = SoyElement;
