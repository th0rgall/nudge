// Extract core domain from URL you want to check
function extractDomain(url) {
  var getLocation = function(href) {
    var location = document.createElement("a");
    location.href = href;
    return location;
  };
  var location = getLocation(url);
  var path = "/" + location.pathname.split("/")[1];
  var domain = location.hostname + path;
  return domain;
}

(function(funcName, baseObj) {
  // The public function name defaults to window.docReady
  // but you can pass in your own object and own function name and those will be used
  // if you want to put them in a different namespace
  funcName = funcName || "docReady";
  baseObj = baseObj || window;
  var readyList = [];
  var readyFired = false;
  var readyEventHandlersInstalled = false;

  // call this when the document is ready
  // this function protects itself against being called more than once
  function ready() {
    if (!readyFired) {
      // this must be set to true before we start calling callbacks
      readyFired = true;
      for (var i = 0; i < readyList.length; i++) {
        // if a callback here happens to add new ready handlers,
        // the docReady() function will see that it already fired
        // and will schedule the callback to run right after
        // this event loop finishes so all handlers will still execute
        // in order and no new ones will be added to the readyList
        // while we are processing the list
        readyList[i].fn.call(window, readyList[i].ctx);
      }
      // allow any closures held by these functions to free
      readyList = [];
    }
  }

  function readyStateChange() {
    if (document.readyState === "complete") {
      ready();
    }
  }

  // This is the one public interface
  // docReady(fn, context);
  // the context argument is optional - if present, it will be passed
  // as an argument to the callback
  baseObj[funcName] = function(callback, context) {
    if (typeof callback !== "function") {
      throw new TypeError("callback for docReady(fn) must be a function");
    }
    // if ready has already fired, then just schedule the callback
    // to fire asynchronously, but right away
    if (readyFired) {
      setTimeout(function() {
        callback(context);
      }, 1);
      return;
    } else {
      // add the function and context to the list
      readyList.push({ fn: callback, ctx: context });
    }
    // if document already ready to go, schedule the ready function to run
    if (document.readyState === "complete") {
      setTimeout(ready, 1);
    } else if (!readyEventHandlersInstalled) {
      // otherwise if we don't have event handlers installed, install them
      if (document.addEventListener) {
        // first choice is DOMContentLoaded event
        document.addEventListener("DOMContentLoaded", ready, false);
        // backup is window load event
        window.addEventListener("load", ready, false);
      } else {
        // must be IE
        document.attachEvent("onreadystatechange", readyStateChange);
        window.attachEvent("onload", ready);
      }
      readyEventHandlersInstalled = true;
    }
  };
})("docReady", window);

function notUndefined(x) {
  if (typeof x === "undefined") {
    return false;
  } else {
    return true;
  }
}

function getUrl(path) {
  return chrome.extension.getURL(path);
}

function sendHTMLRequest(url, callback, errorFunction) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      var response = request.responseText;
      callback(url, response);
    } else {
      // We reached our target server, but it returned an error
    }
  };

  request.onerror = function() {
    console.log("Error in HTML request");
    if (errorFunction) {
      errorFunction;
    }
  };

  request.send();
}

function append(parent, newChild) {
  console.log(parent);
  console.log(newChild);
  parent.appendChild(newChild);
}

function addCSS(cssId, nudgeUrl) {
  if (!document.getElementById(cssId)) {
    var head = document.getElementsByTagName("head")[0];
    var link = document.createElement("link");
    link.id = cssId;
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = chrome.extension.getURL(nudgeUrl);
    link.media = "all";
    head.appendChild(link);
  }
}

function addScript(scriptId, nudgeUrl, dataObj) {
  if (!document.getElementById(scriptId)) {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.id = scriptId;
    script.type = "text/javascript";
    script.src = chrome.extension.getURL(nudgeUrl);
    if (dataObj) {
      Object.keys(dataObj).forEach(function(key) {
        script.dataset[key] = dataObj[key];
      });
    }
    head.appendChild(script);
  }
}

// Generate userId
function getUserId() {
  // E.g. 8 * 32 = 256 bits token
  var randomPool = new Uint8Array(32);
  crypto.getRandomValues(randomPool);
  var hex = "";
  for (var i = 0; i < randomPool.length; ++i) {
    hex += randomPool[i].toString(16);
  }
  // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
  return hex;
}

// Helper function ordinal number parser
function ordinal(i) {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}

// Helper second to minute parser
function minutes(i) {
  if (i >= 105) {
    return Math.round(i / 60) + " minutes";
  } else if (i === 1) {
    return "one second";
  } else if (i < 45) {
    return Math.round(i) + " seconds";
  } else if (i < 60) {
    return "a minute";
  } else if (i < 105) {
    return "2 minutes";
  } else {
    // console.log("minute function didn't work");
  }
}

// Checks if object is empty
function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

// Helper - gets random from array
function randomGetter(init, current) {
  var index = Math.floor(Math.random() * current.length);
  if (current.length === 0) {
    for (var i = 0; i < init.length; i++) {
      current.push(init[i]);
    }
    console.log(current);
  }
  var name = current[index];
  if (index > -1) {
    current.splice(index, 1);
  }
  return name;
}

function createEl(parent, type, name) {
  var element = document.createElement(type);
  if (name) {
    element.id = name;
  }
  parent.appendChild(element);
  return element;
}

function parseHtml(htmlText) {
  parser = new DOMParser();
  doc = parser.parseFromString(htmlText, "text/html").body.childNodes;
  return doc;
}

function deleteEl(element) {
  if (!element || !element.parentNode) {
    return;
  }
  element.parentNode.removeChild(element);
}

var nudgeLink = "http://bit.ly/2gFsVrf";

function ifDoesntExistMakeZero(a, b) {
  if (!a || a == "undefined" || a == null) {
    return b;
  } else {
    return a;
  }
}

function copyText() {
  var copyText = createEl(document.body, "textArea", "copyText");
  var selection = $("#copyText")
    .val(nudgeLink)
    .select();
  document.execCommand("copy");
  selection.val("");
  deleteEl(copyText);
}

// 2 digit slicer
function lastTwo(number) {
  var formattedNumber = ("0" + number).slice(-2);
  return formattedNumber;
}

// Turn lots of seconds into e.g. 10m15s
function logMinutes(time) {
  var minutes = Math.floor(time / 60);
  var seconds = Math.floor(time) % 60;
  return minutes + "m" + lastTwo(seconds) + "s";
}

// Text for button
function badgeTime(time) {
  var minutes = Math.floor(time / 60);
  var seconds = Math.floor(time) % 60;
  if (time > 59) {
    return minutes + "m";
  } else {
    return seconds + "s";
  }
}

// Adds together two numbers onto the second
function addTogether(a, b) {
  if (!a || a == "undefined" || a == null) {
    a = 0;
  }
  b = a + b;
  return b;
}

// Add style to document
function styleAdder(name, style, log) {
  var styleText = name + style;
  style = document.createElement("style");
  style.innerHTML = styleText;
  document.head.appendChild(style);
  if (log) {
    console.log(styleText);
  }
}

// Send event from content script
function eventLogSender(domain, eventType, detailsObj) {
  if (!detailsObj) {
    detailsObj = false;
  }
  // should be a SENDMESSAGE so it can happen from anywhere in the app
  chrome.runtime.sendMessage({
    type: "event",
    domain,
    eventType,
    detailsObj,
    date: moment().format("YYYY-MM-DD"),
    time: moment()
  }); // needs receiver
}

// Helper to check if key defined
function keyDefined(object, key) {
  if (object[key] !== undefined) {
    return true;
  } else {
    return false;
  }
}

function toggleClass(el, className) {
  if (el.classList) {
    el.classList.toggle(className);
  } else {
    var classes = el.className.split(" ");
    var existingIndex = classes.indexOf(className);
    if (existingIndex >= 0) classes.splice(existingIndex, 1);
    else classes.push(className);
    el.className = classes.join(" ");
  }
}

function doAtEarliest(callback) {
  document.addEventListener("DOMSubtreeModified", runCallback, false);
  function runCallback() {
    if (document.head) {
      document.removeEventListener("DOMSubtreeModified", runCallback, false);
      callback();
    }
  }
}

function sendMessage(type, object) {
  object.type = type;
  chrome.runtime.sendMessage(object);
}

// Helper function for chaining
function classList(element) {
  var list = element.classList;
  return {
    toggle: function(c) {
      list.toggle(c);
      return this;
    },
    add: function(c) {
      list.add(c);
      return this;
    },
    remove: function(c) {
      list.remove(c);
      return this;
    }
  };
}

function storeForUse(url, response) {
  url = url.split("/").pop();
  if (notUndefined(tempStorage)) {
    tempStorage[url] = response;
  } else {
    console.log("tempStorage is not defined in this script");
  }
}

function appendHtml(parent, childString, callback) {
  if (parent) {
    parent.insertAdjacentHTML("afterbegin", childString);
  }
  if (callback) {
    callback();
  }
}

// Create a random delay between XMLHttpRequests
function randomTime(floor, variance) {
  var ms = 1000;
  return Math.floor(ms * (floor + Math.random() * variance));
}

// optimise mutationObserver https://stackoverflow.com/questions/31659567/performance-of-mutationobserver-to-detect-nodes-in-entire-dom
// especially the point about using getElementById

function fbTokenReady(name, callback) {
  var found = false;

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var node = document.getElementsByName(name);
        node = node[0];
        if (!found && notUndefined(node)) {
          found = true;
          observer.disconnect();
          if (callback) {
            callback(node);
          }
        }
      }
    });
  });

  observer.observe(document, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
}

function click(x, y) {
  var ev = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
    screenX: x,
    screenY: y
  });

  var el = document.elementFromPoint(x, y);

  el.dispatchEvent(ev);
}

function getSettings(callback) {
  chrome.runtime.sendMessage({ type: "settings" }, function(response) {
    callback(response.settings);
  });
}

function changeSettingRequest(newVal, setting, domain, domainSetting) {
  if (!domain) {
    domain = false;
  }
  if (!domainSetting) {
    domainSetting = false;
  }
  sendMessage("change_setting", {
    newVal,
    setting,
    domain,
    domainSetting
  });
}