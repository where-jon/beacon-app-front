var cssPrefix = 'tui-full-calendar-',
    timeGetViewID = new RegExp('^' + cssPrefix + 'time-date');

export const config = {
    throwError: function(msg) {
        /* @if BUNDLE_TYPE='Release' */
        alert(msg);
        /* @endif */
        /* @if BUNDLE_TYPE='Debug' */
        throw new Error(msg);
        /* @endif */
    },

    cssPrefix: cssPrefix,

    classname: function(str) {
        str = str || '';

        if (str.charAt(0) === '.') {
            return '.' + config.cssPrefix + str.slice(1);
        }

        return config.cssPrefix + str;
    },

    time: {
        getViewIDRegExp: timeGetViewID
    }
}

