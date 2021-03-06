const BASE = 'spinevis';

const factoryDef = ['$window', function($window) {
    /**
     * Sets the document's title (using $window.document.title). For example:
     * `title.set('hello')` will change the title of the tab to
     * "spinevis | hello". If `where` is undefined, only the app name will be
     * shown: `title.set()` results in a title of "spinevis".
     *
     * @param {*} where
     */
    const set = (where) => {
        let title = BASE;

        if (where !== undefined) {
            title += ' | ' + where;
        }

        $window.document.title = title;
    };

    /**
     * Sets the title to the base. Equivalent to calling `title.set()`.
     */
    const useBase = () => { set(); };

    return {
        useBase: useBase,
        set: set
    };
}];

module.exports = {
    name: 'title',
    def: factoryDef
};
