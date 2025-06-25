import {
  invoke
} from "./chunk-URWMUQW3.js";
import {
  __async
} from "./chunk-WDMUDEB6.js";

// node_modules/@tauri-apps/plugin-dialog/dist-js/index.js
function open() {
  return __async(this, arguments, function* (options = {}) {
    if (typeof options === "object") {
      Object.freeze(options);
    }
    return yield invoke("plugin:dialog|open", { options });
  });
}
function save() {
  return __async(this, arguments, function* (options = {}) {
    if (typeof options === "object") {
      Object.freeze(options);
    }
    return yield invoke("plugin:dialog|save", { options });
  });
}
function message(message2, options) {
  return __async(this, null, function* () {
    const opts = typeof options === "string" ? { title: options } : options;
    yield invoke("plugin:dialog|message", {
      message: message2.toString(),
      title: opts?.title?.toString(),
      kind: opts?.kind,
      okButtonLabel: opts?.okLabel?.toString()
    });
  });
}
function ask(message2, options) {
  return __async(this, null, function* () {
    const opts = typeof options === "string" ? { title: options } : options;
    return yield invoke("plugin:dialog|ask", {
      message: message2.toString(),
      title: opts?.title?.toString(),
      kind: opts?.kind,
      yesButtonLabel: opts?.okLabel?.toString(),
      noButtonLabel: opts?.cancelLabel?.toString()
    });
  });
}
function confirm(message2, options) {
  return __async(this, null, function* () {
    const opts = typeof options === "string" ? { title: options } : options;
    return yield invoke("plugin:dialog|confirm", {
      message: message2.toString(),
      title: opts?.title?.toString(),
      kind: opts?.kind,
      okButtonLabel: opts?.okLabel?.toString(),
      cancelButtonLabel: opts?.cancelLabel?.toString()
    });
  });
}
export {
  ask,
  confirm,
  message,
  open,
  save
};
//# sourceMappingURL=@tauri-apps_plugin-dialog.js.map
