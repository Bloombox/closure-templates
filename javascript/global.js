/**
 * @fileoverview
 *
 * Getters for Soy Idom runtime. Required because we don't want to incur a
 * runtime cost for requiring incrementaldom directly.
 */
goog.module('google3.javascript.template.soy.global');
var module = module || { id: 'javascript/template/soy/global.js' };
var goog_goog_asserts_1 = goog.require('goog.asserts'); // from //javascript/closure/asserts
/**
 * Retrieves the Soy element in a type-safe way.
 *
 * <p>Requires that the node has been rendered by this element already. Will
 * throw an Error if this is not true.
 */
function getSoy(node, elementCtor, message) {
  var soyEl = goog_goog_asserts_1.assertInstanceof(getSoyUntyped(node), elementCtor, message);
  // We disable state syncing by default when elements are accessed on the
  // theory that the application wants to take control now.
  soyEl.setSyncState(false);
  return soyEl;
}
exports.getSoy = getSoy;
/** Retrieves the Soy element in a type-safe way, or null if it doesn't exist */
function getSoyOptional(node, elementCtor) {
  if (!node.__soy)
    return null;
  return getSoy(node, elementCtor);
}
exports.getSoyOptional = getSoyOptional;
/**
 * When rehydrating a Soy element, tag the element so that rehydration stops at
 * the Soy element boundary.
 */
function tagForSkip(node) {
  node.__soy_tagged_for_skip = true;
}
exports.tagForSkip = tagForSkip;
/**
 * Once a soy element has been tagged, reset the tag.
 */
function isTaggedForSkip(node) {
  var isTaggedForSkip = node.__soy_tagged_for_skip;
  node.__soy_tagged_for_skip = false;
  return isTaggedForSkip;
}
exports.isTaggedForSkip = isTaggedForSkip;
/** Retrieves an untyped Soy element, or null if it doesn't exist. */
function getSoyUntyped(node) {
  return node.__soy;
}
exports.getSoyUntyped = getSoyUntyped;
