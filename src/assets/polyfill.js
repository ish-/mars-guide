/* Polyfill service v3.8.1
 * For detailed credits and licence information see http://github.com/financial-times/polyfill-service.
 * 
 * UA detected: chrome/51.0.0
 * Features requested: Object.assign,Object.create,Promise
 * 
 * - Object.assign, License: CC0
 * - Object.defineProperty, License: CC0 (required by "Array.isArray", "Object.create", "Object.defineProperties", "Promise")
 * - Object.defineProperties, License: CC0 (required by "Object.create")
 * - Object.create, License: CC0
 * - setImmediate, License: CC0 (required by "Promise")
 * - Array.isArray, License: CC0 (required by "Promise")
 * - Promise, License: MIT */

(function(undefined) {
if (!('assign' in Object)) {

// Object.assign
Object.assign = function assign(target, source) {
    for (var index = 1, key, src; index < arguments.length; ++index) {
        src = arguments[index];

        for (key in src) {
            if (Object.prototype.hasOwnProperty.call(src, key)) {
                target[key] = src[key];
            }
        }
    }

    return target;
};
}

if (!(// In IE8, defineProperty could only act on DOM elements, so full support
// for the feature requires the ability to set a property on an arbitrary object
'defineProperty' in Object && (function() {
    try {
        var a = {};
        Object.defineProperty(a, 'test', {value:42});
        return true;
    } catch(e) {
        return false
    }
}()))) {

// Object.defineProperty
(function (nativeDefineProperty) {

    var supportsAccessors = Object.prototype.hasOwnProperty('__defineGetter__');
    var ERR_ACCESSORS_NOT_SUPPORTED = 'Getters & setters cannot be defined on this javascript engine';
    var ERR_VALUE_ACCESSORS = 'A property cannot both have accessors and be writable or have a value';

    Object.defineProperty = function defineProperty(object, property, descriptor) {

        // Where native support exists, assume it
        if (nativeDefineProperty && (object === window || object === document || object === Element.prototype || object instanceof Element)) {
            return nativeDefineProperty(object, property, descriptor);
        }

        var propertyString = String(property);
        var hasValueOrWritable = 'value' in descriptor || 'writable' in descriptor;
        var getterType = 'get' in descriptor && typeof descriptor.get;
        var setterType = 'set' in descriptor && typeof descriptor.set;

        if (object === null || !(object instanceof Object || typeof object === 'object')) {
            throw new TypeError('Object must be an object (Object.defineProperty polyfill)');
        }

        if (!(descriptor instanceof Object)) {
            throw new TypeError('Descriptor must be an object (Object.defineProperty polyfill)');
        }

        // handle descriptor.get
        if (getterType) {
            if (getterType !== 'function') {
                throw new TypeError('Getter expected a function (Object.defineProperty polyfill)');
            }
            if (!supportsAccessors) {
                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
            }
            if (hasValueOrWritable) {
                throw new TypeError(ERR_VALUE_ACCESSORS);
            }
            object.__defineGetter__(propertyString, descriptor.get);
        } else {
            object[propertyString] = descriptor.value;
        }

        // handle descriptor.set
        if (setterType) {
            if (setterType !== 'function') {
                throw new TypeError('Setter expected a function (Object.defineProperty polyfill)');
            }
            if (!supportsAccessors) {
                throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
            }
            if (hasValueOrWritable) {
                throw new TypeError(ERR_VALUE_ACCESSORS);
            }
            object.__defineSetter__(propertyString, descriptor.set);
        }

        // OK to define value unconditionally - if a getter has been specified as well, an error would be thrown above
        if ('value' in descriptor) {
            object[propertyString] = descriptor.value;
        }

        return object;
    };
}(Object.defineProperty));
}

if (!('defineProperties' in Object)) {

// Object.defineProperties
Object.defineProperties = function defineProperties(object, descriptors) {
    for (var property in descriptors) {
        Object.defineProperty(object, property, descriptors[property]);
    }

    return object;
};
}

if (!('create' in Object)) {

// Object.create
Object.create = function create(prototype, properties) {
    /* jshint evil: true */
    if (typeof prototype !== 'object' && prototype !== null) {
      throw TypeError('Object prototype may only be an Object or null');
    }

    var
    object = new Function('e', 'function Object() {}Object.prototype=e;return new Object')(prototype);

    object.constructor.prototype = prototype;

    if (1 in arguments) {
        Object.defineProperties(object, properties);
    }

    return object;
};
}

if (!('setImmediate' in window)) {

// setImmediate
(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));
}

if (!('isArray' in Array)) {

// Array.isArray
(function (toString) {
    Object.defineProperty(Array, 'isArray', {
        configurable: true,
        value: function isArray(object) {
            return toString.call(object) === '[object Array]';
        },
        writable: true
    });
})(Object.prototype.toString);
}

if (!('Promise' in this)) {

// Promise
/**
 * Promise polyfill v1.0.10
 * requires setImmediate
 *
 * © 2014–2015 Dmitry Korobkin
 * Released under the MIT license
 * github.com/Octane/Promise
 */
(function (global) {'use strict';

    var STATUS = '[[PromiseStatus]]';
    var VALUE = '[[PromiseValue]]';
    var ON_FUlFILLED = '[[OnFulfilled]]';
    var ON_REJECTED = '[[OnRejected]]';
    var ORIGINAL_ERROR = '[[OriginalError]]';
    var PENDING = 'pending';
    var INTERNAL_PENDING = 'internal pending';
    var FULFILLED = 'fulfilled';
    var REJECTED = 'rejected';
    var NOT_ARRAY = 'not an array.';
    var REQUIRES_NEW = 'constructor Promise requires "new".';
    var CHAINING_CYCLE = 'then() cannot return same Promise that it resolves.';

    // Modifed by polyfill service - remove undefined require statement
    var setImmediate = global.setImmediate;

    var isArray = Array.isArray || function (anything) {
        return Object.prototype.toString.call(anything) == '[object Array]';
    };

    function InternalError(originalError) {
        this[ORIGINAL_ERROR] = originalError;
    }

    function isInternalError(anything) {
        return anything instanceof InternalError;
    }

    function isObject(anything) {
        //Object.create(null) instanceof Object → false
        return Object(anything) === anything;
    }

    function isCallable(anything) {
        return typeof anything == 'function';
    }

    function isPromise(anything) {
        return anything instanceof Promise;
    }

    function identity(value) {
        return value;
    }

    function thrower(reason) {
        throw reason;
    }

    function enqueue(promise, onFulfilled, onRejected) {
        if (!promise[ON_FUlFILLED]) {
            promise[ON_FUlFILLED] = [];
            promise[ON_REJECTED] = [];
        }
        promise[ON_FUlFILLED].push(onFulfilled);
        promise[ON_REJECTED].push(onRejected);
    }

    function clearAllQueues(promise) {
        delete promise[ON_FUlFILLED];
        delete promise[ON_REJECTED];
    }

    function callEach(queue) {
        var i;
        var length = queue.length;
        for (i = 0; i < length; i++) {
            queue[i]();
        }
    }

    function call(resolve, reject, value) {
        var anything = toPromise(value);
        if (isPromise(anything)) {
            anything.then(resolve, reject);
        } else if (isInternalError(anything)) {
            reject(anything[ORIGINAL_ERROR]);
        } else {
            resolve(value);
        }
    }

    function toPromise(anything) {
        var then;
        if (isPromise(anything)) {
            return anything;
        }
        if(isObject(anything)) {
            try {
                then = anything.then;
            } catch (error) {
                return new InternalError(error);
            }
            if (isCallable(then)) {
                return new Promise(function (resolve, reject) {
                    setImmediate(function () {
                        try {
                            then.call(anything, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    });
                });
            }
        }
        return null;
    }

    function resolvePromise(promise, resolver) {
        function resolve(value) {
            if (promise[STATUS] == PENDING) {
                fulfillPromise(promise, value);
            }
        }
        function reject(reason) {
            if (promise[STATUS] == PENDING) {
                rejectPromise(promise, reason);
            }
        }
        try {
            resolver(resolve, reject);
        } catch(error) {
            reject(error);
        }
    }

    function fulfillPromise(promise, value) {
        var queue;
        var anything = toPromise(value);
        if (isPromise(anything)) {
            promise[STATUS] = INTERNAL_PENDING;
            anything.then(
                function (value) {
                    fulfillPromise(promise, value);
                },
                function (reason) {
                    rejectPromise(promise, reason);
                }
            );
        } else if (isInternalError(anything)) {
            rejectPromise(promise, anything[ORIGINAL_ERROR]);
        } else {
            promise[STATUS] = FULFILLED;
            promise[VALUE] = value;
            queue = promise[ON_FUlFILLED];
            if (queue && queue.length) {
                clearAllQueues(promise);
                callEach(queue);
            }
        }
    }

    function rejectPromise(promise, reason) {
        var queue = promise[ON_REJECTED];
        promise[STATUS] = REJECTED;
        promise[VALUE] = reason;
        if (queue && queue.length) {
            clearAllQueues(promise);
            callEach(queue);
        }
    }

    function Promise(resolver) {
        var promise = this;
        if (!isPromise(promise)) {
            throw new TypeError(REQUIRES_NEW);
        }
        promise[STATUS] = PENDING;
        promise[VALUE] = undefined;
        resolvePromise(promise, resolver);
    }

    Promise.prototype.then = function (onFulfilled, onRejected) {
        var promise = this;
        var nextPromise;
        onFulfilled = isCallable(onFulfilled) ? onFulfilled : identity;
        onRejected = isCallable(onRejected) ? onRejected : thrower;
        nextPromise = new Promise(function (resolve, reject) {
            function tryCall(func) {
                var value;
                try {
                    value = func(promise[VALUE]);
                } catch (error) {
                    reject(error);
                    return;
                }
                if (value === nextPromise) {
                    reject(new TypeError(CHAINING_CYCLE));
                } else {
                    call(resolve, reject, value);
                }
            }
            function asyncOnFulfilled() {
                setImmediate(tryCall, onFulfilled);
            }
            function asyncOnRejected() {
                setImmediate(tryCall, onRejected);
            }
            switch (promise[STATUS]) {
                case FULFILLED:
                    asyncOnFulfilled();
                    break;
                case REJECTED:
                    asyncOnRejected();
                    break;
                default:
                    enqueue(promise, asyncOnFulfilled, asyncOnRejected);
            }
        });
        return nextPromise;
    };

    Promise.prototype['catch'] = function (onRejected) {
        return this.then(identity, onRejected);
    };

    Promise.resolve = function (value) {
        var anything = toPromise(value);
        if (isPromise(anything)) {
            return anything;
        }
        return new Promise(function (resolve, reject) {
            if (isInternalError(anything)) {
                reject(anything[ORIGINAL_ERROR]);
            } else {
                resolve(value);
            }
        });
    };

    Promise.reject = function (reason) {
        return new Promise(function (resolve, reject) {
            reject(reason);
        });
    };

    Promise.race = function (values) {
        return new Promise(function (resolve, reject) {
            var i;
            var length;
            if (isArray(values)) {
                length = values.length;
                for (i = 0; i < length; i++) {
                    call(resolve, reject, values[i]);
                }
            } else {
                reject(new TypeError(NOT_ARRAY));
            }
        });
    };

    Promise.all = function (values) {
        return new Promise(function (resolve, reject) {
            var fulfilledCount = 0;
            var promiseCount = 0;
            var anything;
            var length;
            var value;
            var i;
            if (isArray(values)) {
                values = values.slice(0);
                length = values.length;
                for (i = 0; i < length; i++) {
                    value = values[i];
                    anything = toPromise(value);
                    if (isPromise(anything)) {
                        promiseCount++;
                        anything.then(
                            function (index) {
                                return function (value) {
                                    values[index] = value;
                                    fulfilledCount++;
                                    if (fulfilledCount == promiseCount) {
                                        resolve(values);
                                    }
                                };
                            }(i),
                            reject
                        );
                    } else if (isInternalError(anything)) {
                        reject(anything[ORIGINAL_ERROR]);
                    } else {
                        //[1, , 3] → [1, undefined, 3]
                        values[i] = value;
                    }
                }
                if (!promiseCount) {
                    resolve(values);
                }
            } else {
                reject(new TypeError(NOT_ARRAY));
            }
        });
    };

    if (!global.Promise) {
        global.Promise = Promise;
    }

}(this));
}


})
.call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});