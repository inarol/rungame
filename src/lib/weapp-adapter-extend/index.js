import _window from './window';

function inject() {
    const { platform } = wx.getSystemInfoSync()
    // 开发者工具无法重定义 window
    if (typeof __devtoolssubcontext === 'undefined' && platform === 'devtools') {
        for (const key in _window) {
            const descriptor = Object.getOwnPropertyDescriptor(global, key)

            if (!descriptor || descriptor.configurable === true) {
                Object.defineProperty(window, key, {
                    value: _window[key]
                })
            }
        }
        window.parent = window
    } else {
        for (const key in _window) {
            global[key] = _window[key]
        }
        global.window = global
        global.top = global.parent = global
    }
}

inject()
