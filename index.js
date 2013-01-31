var deleteInDirectory = require('./lib/deleteInDirectory');
var comparators = require('./lib/comparators');

module.exports = function (startPath, options) {
	var options = options || {};
	deleteInDirectory(startPath, comparators.mtime, options, function (error, meta) {
		var size = meta.size;
		var files = meta.files;
		var unit = "byte";
		if (size > 1048576) {
			size = size / 1048576;
			unit = "mb";
		} else if (size > 1024) {
			size = size / 1024;
			unit = "kb";
		}
		size = Math.round(size * 100) / 100;
		var dryRunString = options.dryRun ? " (dryrun)" : "";
		console.log("Deleted " + files + " files with a total size of " + size + unit + "." + dryRunString);
	});
}
