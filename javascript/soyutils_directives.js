/*
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.module('google3.javascript.template.soy.soyutils_directives');
var module = module || { id: 'javascript/template/soy/soyutils_directives.js' };
var goog_goog_soy_data_SanitizedContentKind_1 = goog.require('goog.soy.data.SanitizedContentKind'); // from //javascript/closure/soy:data
var soy = goog.require('soy'); // from //javascript/template/soy:soy_usegoog_js
var goog_soy_checks_1 = goog.require('soy.checks'); // from //javascript/template/soy:checks
var goog_soydata_VERY_UNSAFE_1 = goog.require('soydata.VERY_UNSAFE'); // from //javascript/template/soy:soy_usegoog_js
function isIdomFunctionType(
// tslint:disable-next-line:no-any
value, type) {
  return goog.isFunction(value) && value.contentKind === type;
}
exports.$$isIdomFunctionType = isIdomFunctionType;
/**
 * Specialization of filterHtmlAttributes for Incremental DOM that can handle
 * attribute functions gracefully. In any other situation, this delegates to
 * the regular escaping directive.
 */
// tslint:disable-next-line:no-any
function filterHtmlAttributes(value) {
  if (isIdomFunctionType(value, goog_goog_soy_data_SanitizedContentKind_1.ATTRIBUTES) ||
      goog_soy_checks_1.isAttribute(value)) {
    return value;
  }
  return soy.$$filterHtmlAttributes(value);
}
exports.$$filterHtmlAttributes = filterHtmlAttributes;
/**
 * Specialization of escapeHtml for Incremental DOM that can handle
 * html functions gracefully. In any other situation, this delegates to
 * the regular escaping directive.
 */
// tslint:disable-next-line:no-any
function escapeHtml(value, renderer) {
  if (isIdomFunctionType(value, goog_goog_soy_data_SanitizedContentKind_1.HTML)) {
    return goog_soydata_VERY_UNSAFE_1.ordainSanitizedHtml(value.toString(renderer));
  }
  return soy.$$escapeHtml(value);
}
exports.$$escapeHtml = escapeHtml;
/**
 * Specialization of bidiUnicodeWrap for Incremental DOM that can handle
 * html functions gracefully. In any other situation, this delegates to
 * the regular escaping directive.
 */
function bidiUnicodeWrap(
// tslint:disable-next-line:no-any
bidiGlobalDir, value, renderer) {
  if (isIdomFunctionType(value, goog_goog_soy_data_SanitizedContentKind_1.HTML)) {
    return soy.$$bidiUnicodeWrap(bidiGlobalDir, goog_soydata_VERY_UNSAFE_1.ordainSanitizedHtml(value.toString(renderer)));
  }
  return soy.$$bidiUnicodeWrap(bidiGlobalDir, value);
}
exports.$$bidiUnicodeWrap = bidiUnicodeWrap;
