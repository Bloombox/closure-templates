/*
 * @fileoverview Helper utilities for incremental dom code generation in Soy.
 * Copyright 2016 Google Inc.
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
goog.module('google3.javascript.template.soy.soyutils_idom');
var module = module || { id: 'javascript/template/soy/soyutils_idom.js' };
var tslib_1 = goog.require('google3.third_party.javascript.tslib.tslib_closure');
var googSoy = goog.require('goog.soy'); // from //javascript/closure/soy
var goog_goog_soy_data_SanitizedContentKind_1 = goog.require('goog.soy.data.SanitizedContentKind'); // from //javascript/closure/soy:data
var goog_goog_soy_data_SanitizedHtml_1 = goog.require('goog.soy.data.SanitizedHtml'); // from //javascript/closure/soy:data
var googString = goog.require('goog.string'); // from //javascript/closure/string
var soy = goog.require('soy'); // from //javascript/template/soy:soy_usegoog_js
var goog_soy_checks_1 = goog.require('soy.checks'); // from //javascript/template/soy:checks
var goog_soydata_VERY_UNSAFE_1 = goog.require('soydata.VERY_UNSAFE'); // from //javascript/template/soy:soy_usegoog_js
var incrementaldom = goog.require('google3.third_party.javascript.incremental_dom.index'); // from //third_party/javascript/incremental_dom:incrementaldom
var api_idom_1 = goog.require('google3.javascript.template.soy.api_idom');
var element_lib_idom_1 = goog.require('google3.javascript.template.soy.element_lib_idom');
exports.$SoyElement = element_lib_idom_1.SoyElement;
var global_1 = goog.require('google3.javascript.template.soy.global');
// Declare properties that need to be applied not as attributes but as
// actual DOM properties.
var attributes = incrementaldom.attributes, getKey = incrementaldom.getKey, isDataInitialized = incrementaldom.isDataInitialized;
var defaultIdomRenderer = new api_idom_1.IncrementalDomRenderer();
// tslint:disable-next-line:no-any
attributes['checked'] = function (el, name, value) {
  // We don't use !!value because:
  // 1. If value is '' (this is the case where a user uses <div checked />),
  //    the checked value should be true, but '' is falsy.
  // 2. If value is 'false', the checked value should be false, but
  //    'false' is truthy.
  el.setAttribute('checked', value);
  el.checked =
      !(value === false || value === 'false' || value === undefined);
};
// tslint:disable-next-line:no-any
attributes['value'] = function (el, name, value) {
  el.value = value;
  el.setAttribute('value', value);
};
// Soy uses the {key} command syntax, rather than HTML attributes, to
// indicate element keys.
incrementaldom.setKeyAttributeName(null);
/**
 * Tries to find an existing Soy element, if it exists. Otherwise, it creates
 * one. Afterwards, it queues up a Soy element (see docs for queueSoyElement)
 * and then proceeds to render the Soy element.
 */
function handleSoyElement(incrementaldom, elementClassCtor, firstElementKey, data, ijData) {
  var soyElementKey = firstElementKey + incrementaldom.getCurrentKeyStack();
  var currentPointer = incrementaldom.currentPointer();
  var el = null;
  while (currentPointer != null) {
    var maybeSoyEl = global_1.getSoyUntyped(currentPointer);
    // We cannot use the current key of the element because many layers
    // of template calls may have happened. We can only be sure that the Soy
    // element was the same if the key constructed is matching the key current
    // when the {element} command was created.
    if (maybeSoyEl instanceof elementClassCtor &&
        api_idom_1.isMatchingKey(soyElementKey, maybeSoyEl.key)) {
      el = maybeSoyEl;
      break;
    }
    currentPointer = currentPointer.nextSibling;
  }
  if (!el) {
    el = new elementClassCtor(data, ijData);
    el.key = soyElementKey;
  }
  el.queueSoyElement(incrementaldom, data);
  el.renderInternal(incrementaldom, data);
  return el;
}
exports.$$handleSoyElement = handleSoyElement;
// tslint:disable-next-line:no-any Attaching arbitrary attributes to function.
function makeHtml(idomFn) {
  idomFn.toString = function (renderer) {
    if (renderer === void 0) { renderer = defaultIdomRenderer; }
    return htmlToString(idomFn, renderer);
  };
  idomFn.toBoolean = function () { return toBoolean(idomFn); };
  idomFn.contentKind = goog_goog_soy_data_SanitizedContentKind_1.HTML;
  return idomFn;
}
exports.$$makeHtml = makeHtml;
// tslint:disable-next-line:no-any Attaching arbitrary attributes to function.
function makeAttributes(idomFn) {
  idomFn.toString = function () { return attributesToString(idomFn); };
  idomFn.toBoolean = function () { return toBoolean(idomFn); };
  idomFn.contentKind = goog_goog_soy_data_SanitizedContentKind_1.ATTRIBUTES;
  return idomFn;
}
exports.$$makeAttributes = makeAttributes;
/**
 * TODO(tomnguyen): Issue a warning in these cases so that users know that
 * expensive behavior is happening.
 */
function htmlToString(fn, renderer) {
  if (renderer === void 0) { renderer = defaultIdomRenderer; }
  var el = document.createElement('div');
  api_idom_1.patch(el, function () {
    fn(renderer);
  });
  return el.innerHTML;
}
exports.$$htmlToString = htmlToString;
function attributesFactory(fn) {
  return function () {
    incrementaldom.open('div');
    fn(defaultIdomRenderer);
    incrementaldom.applyAttrs();
    incrementaldom.close();
  };
}
/**
 * TODO(tomnguyen): Issue a warning in these cases so that users know that
 * expensive behavior is happening.
 */
function attributesToString(fn) {
  var elFn = attributesFactory(fn);
  var el = document.createElement('div');
  api_idom_1.patchOuter(el, elFn);
  var s = [];
  for (var i = 0; i < el.attributes.length; i++) {
    s.push(el.attributes[i].name + "=" + el.attributes[i].value);
  }
  // The sort is important because attribute order varies per browser.
  return s.sort().join(' ');
}
function toBoolean(fn) {
  return fn.toString().length > 0;
}
/**
 * Calls an expression in case of a function or outputs it as text content.
 */
function renderDynamicContent(incrementaldom, expr) {
  // TODO(lukes): check content kind == html
  if (typeof expr === 'function') {
    // The Soy compiler will validate the content kind of the parameter.
    expr(incrementaldom);
  }
  else {
    incrementaldom.text(String(expr));
  }
}
/**
 * Matches an HTML attribute name value pair.
 * Name is in group 1.  Value, if present, is in one of group (2,3,4)
 * depending on how it's quoted.
 *
 * This RegExp was derived from visual inspection of
 *   html.spec.whatwg.org/multipage/parsing.html#before-attribute-name-state
 * and following states.
 */
var htmlAttributeRegExp = /([^\t\n\f\r />=]+)[\t\n\f\r ]*(?:=[\t\n\f\r ]*(?:"([^"]*)"?|'([^']*)'?|([^\t\n\f\r >]*)))?/g;
function splitAttributes(attributes) {
  var nameValuePairs = [];
  String(attributes).replace(htmlAttributeRegExp, function (_, name, dq, sq, uq) {
    nameValuePairs.push([name, googString.unescapeEntities(dq || sq || uq || '')]);
    return ' ';
  });
  return nameValuePairs;
}
/**
 * Calls an expression in case of a function or outputs it as text content.
 */
function callDynamicAttributes(incrementaldom,
                               // tslint:disable-next-line:no-any
                               expr, data, ij) {
  // tslint:disable-next-line:no-any Attaching arbitrary attributes to function.
  var type = expr.contentKind;
  if (type === goog_goog_soy_data_SanitizedContentKind_1.ATTRIBUTES) {
    expr(incrementaldom, data, ij);
  }
  else {
    var val = void 0;
    if (type === goog_goog_soy_data_SanitizedContentKind_1.HTML) {
      // This effectively negates the value of splitting a string. However,
      // This can be removed if Soy decides to treat attribute printing
      // and attribute names differently.
      val = soy.$$filterHtmlAttributes(htmlToString(function () {
        expr(defaultIdomRenderer, data, ij);
      }));
    }
    else {
      val = expr(data, ij);
    }
    printDynamicAttr(incrementaldom, val);
  }
}
exports.$$callDynamicAttributes = callDynamicAttributes;
/**
 * Prints an expression whose type is not statically known to be of type
 * "attributes". The expression is tested at runtime and evaluated depending
 * on what type it is. For example, if a string is printed in a context
 * that expects attributes, the string is evaluated dynamically to compute
 * attributes.
 */
function printDynamicAttr(incrementaldom, expr) {
  var e_1, _a;
  if (goog.isFunction(expr) &&
      expr.contentKind === goog_goog_soy_data_SanitizedContentKind_1.ATTRIBUTES) {
    // tslint:disable-next-line:no-any
    expr(incrementaldom);
    return;
  }
  var attributes = splitAttributes(expr.toString());
  var isExprAttribute = goog_soy_checks_1.isAttribute(expr);
  try {
    for (var attributes_1 = tslib_1.__values(attributes), attributes_1_1 = attributes_1.next(); !attributes_1_1.done; attributes_1_1 = attributes_1.next()) {
      var attribute = attributes_1_1.value;
      var attrName = isExprAttribute ? attribute[0] :
          soy.$$filterHtmlAttributes(attribute[0]);
      if (attrName === 'zSoyz') {
        incrementaldom.attr(attrName, '');
      }
      else {
        incrementaldom.attr(String(attrName), String(attribute[1]));
      }
    }
  }
  catch (e_1_1) { e_1 = { error: e_1_1 }; }
  finally {
    try {
      if (attributes_1_1 && !attributes_1_1.done && (_a = attributes_1.return)) _a.call(attributes_1);
    }
    finally { if (e_1) throw e_1.error; }
  }
}
exports.$$printDynamicAttr = printDynamicAttr;
/**
 * Calls an expression in case of a function or outputs it as text content.
 */
function callDynamicHTML(incrementaldom, expr, data, ij) {
  // tslint:disable-next-line:no-any Attaching arbitrary attributes to function.
  var type = expr.contentKind;
  if (type === goog_goog_soy_data_SanitizedContentKind_1.HTML) {
    expr(incrementaldom, data, ij);
  }
  else if (type === goog_goog_soy_data_SanitizedContentKind_1.ATTRIBUTES) {
    var val = attributesToString(function () {
      expr(defaultIdomRenderer, data, ij);
    });
    incrementaldom.text(val);
  }
  else {
    var val = expr(data, ij);
    incrementaldom.text(String(val));
  }
}
exports.$$callDynamicHTML = callDynamicHTML;
function callDynamicCss(
// tslint:disable-next-line:no-any Attaching  attributes to function.
incrementaldom, expr, data, ij) {
  var val = callDynamicText(expr, data, ij, soy.$$filterCssValue);
  incrementaldom.text(String(val));
}
exports.$$callDynamicCss = callDynamicCss;
function callDynamicJs(
// tslint:disable-next-line:no-any Attaching attributes to function.
incrementaldom, expr, data, ij) {
  var val = callDynamicText(expr, data, ij, soy.$$escapeJsValue);
  incrementaldom.text(String(val));
}
exports.$$callDynamicJs = callDynamicJs;
/**
 * Calls an expression and coerces it to a string for cases where an IDOM
 * function needs to be concatted to a string.
 */
function callDynamicText(
// tslint:disable-next-line:no-any
expr, data, ij, escFn) {
  var transformFn = escFn ? escFn : function (a) { return a; };
  // tslint:disable-next-line:no-any Attaching arbitrary attributes to function.
  var type = expr.contentKind;
  var val;
  if (type === goog_goog_soy_data_SanitizedContentKind_1.HTML) {
    val = transformFn(htmlToString(function () {
      expr(defaultIdomRenderer, data, ij);
    }));
  }
  else if (type === goog_goog_soy_data_SanitizedContentKind_1.ATTRIBUTES) {
    val = transformFn(attributesToString(function () {
      expr(defaultIdomRenderer, data, ij);
    }));
  }
  else {
    val = expr(data, ij);
  }
  return val;
}
exports.$$callDynamicText = callDynamicText;
/**
 * Prints an expression depending on its type.
 */
function print(incrementaldom, expr, isSanitizedContent) {
  if (expr instanceof goog_goog_soy_data_SanitizedHtml_1 || isSanitizedContent) {
    var content = String(expr);
    // If the string has no < or &, it's definitely not HTML. Otherwise
    // proceed with caution.
    if (content.indexOf('<') < 0 && content.indexOf('&') < 0) {
      incrementaldom.text(content);
    }
    else {
      // For HTML content we need to insert a custom element where we can place
      // the content without incremental dom modifying it.
      var el = incrementaldom.open('html-blob');
      if (el && el.__innerHTML !== content) {
        googSoy.renderHtml(el, goog_soydata_VERY_UNSAFE_1.ordainSanitizedHtml(content));
        el.__innerHTML = content;
      }
      incrementaldom.skip();
      incrementaldom.close();
    }
  }
  else {
    renderDynamicContent(incrementaldom, expr);
  }
}
exports.$$print = print;
function visitHtmlCommentNode(incrementaldom, val) {
  var currNode = incrementaldom.currentElement();
  if (!currNode) {
    return;
  }
  if (currNode.nextSibling != null &&
      currNode.nextSibling.nodeType === Node.COMMENT_NODE) {
    currNode.nextSibling.textContent = val;
    // This is the case where we are creating new DOM from an empty element.
  }
  else {
    currNode.appendChild(document.createComment(val));
  }
  incrementaldom.skipNode();
}
exports.$$visitHtmlCommentNode = visitHtmlCommentNode;
