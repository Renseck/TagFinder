import {
  invoke,
  transformCallback
} from "./chunk-XEW3DY3V.js";
import {
  __async
} from "./chunk-WDMUDEB6.js";

// node_modules/@tauri-apps/api/event.js
var TauriEvent;
(function(TauriEvent2) {
  TauriEvent2["WINDOW_RESIZED"] = "tauri://resize";
  TauriEvent2["WINDOW_MOVED"] = "tauri://move";
  TauriEvent2["WINDOW_CLOSE_REQUESTED"] = "tauri://close-requested";
  TauriEvent2["WINDOW_DESTROYED"] = "tauri://destroyed";
  TauriEvent2["WINDOW_FOCUS"] = "tauri://focus";
  TauriEvent2["WINDOW_BLUR"] = "tauri://blur";
  TauriEvent2["WINDOW_SCALE_FACTOR_CHANGED"] = "tauri://scale-change";
  TauriEvent2["WINDOW_THEME_CHANGED"] = "tauri://theme-changed";
  TauriEvent2["WINDOW_CREATED"] = "tauri://window-created";
  TauriEvent2["WEBVIEW_CREATED"] = "tauri://webview-created";
  TauriEvent2["DRAG_ENTER"] = "tauri://drag-enter";
  TauriEvent2["DRAG_OVER"] = "tauri://drag-over";
  TauriEvent2["DRAG_DROP"] = "tauri://drag-drop";
  TauriEvent2["DRAG_LEAVE"] = "tauri://drag-leave";
})(TauriEvent || (TauriEvent = {}));
function _unlisten(event, eventId) {
  return __async(this, null, function* () {
    yield invoke("plugin:event|unlisten", {
      event,
      eventId
    });
  });
}
function listen(event, handler, options) {
  return __async(this, null, function* () {
    var _a;
    const target = typeof (options === null || options === void 0 ? void 0 : options.target) === "string" ? { kind: "AnyLabel", label: options.target } : (_a = options === null || options === void 0 ? void 0 : options.target) !== null && _a !== void 0 ? _a : { kind: "Any" };
    return invoke("plugin:event|listen", {
      event,
      target,
      handler: transformCallback(handler)
    }).then((eventId) => {
      return () => __async(this, null, function* () {
        return _unlisten(event, eventId);
      });
    });
  });
}
function once(event, handler, options) {
  return __async(this, null, function* () {
    return listen(event, (eventData) => {
      _unlisten(event, eventData.id);
      handler(eventData);
    }, options);
  });
}
function emit(event, payload) {
  return __async(this, null, function* () {
    yield invoke("plugin:event|emit", {
      event,
      payload
    });
  });
}
function emitTo(target, event, payload) {
  return __async(this, null, function* () {
    const eventTarget = typeof target === "string" ? { kind: "AnyLabel", label: target } : target;
    yield invoke("plugin:event|emit_to", {
      target: eventTarget,
      event,
      payload
    });
  });
}
export {
  TauriEvent,
  emit,
  emitTo,
  listen,
  once
};
//# sourceMappingURL=@tauri-apps_api_event.js.map
