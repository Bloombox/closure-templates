/**
 * @fileoverview
 *
 * Setters for optional Soy idom skip handlers. This is for code
 * that needs to run in hybrid idom + non-idom runtime. This allows setting
 * a skip handler if available in the Idom runtime.
 */
goog.module('google3.javascript.template.soy.skiphandler');
var module = module || { id: 'javascript/template/soy/skiphandler.js' };
/**
 * Setter for skip handler
 * @param el Dom node that is the root of a Soy element. The DOM node should be
 *           an {element} even if Incremental DOM isn't being used.
 * @param fn A function that corresponds to the skip handler of the Soy element.
 *           Because this is to be used in contexts without Incremental DOM,
 *           there is some loss in type information.
 * T should correspond to the corresponding interface for the Soy element.
 */
function setSkipHandler(el, fn) {
    el.__soy_skip_handler = fn;
}
exports.setSkipHandler = setSkipHandler;
