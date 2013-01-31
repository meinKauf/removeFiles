var deleteInDirectory = require('./lib/deleteInDirectory');
var comparators = require('./lib/comparators');

module.exports = function (startPath, options) {
	var options = options || {};
	deleteInDirectory(startPath, comparators.mtime, options);
}
