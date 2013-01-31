var fs = require('fs');
var moment = require('moment');

var deleteInDirectory = module.exports = function (path, comparatorFunction, options, callback) {
	if (!removedMeta) {
		var removedMeta = {
			size: 0,
			files: 0
		};
	}
	if (!options) {
		throw new Error("No options argument given");
	}
	if (!options.threshold) {
		throw new Error("Mandatory threshold option not set");
	}
	if (typeof options.dryRun === "undefined") {
		var dryRun = true;
	} else {
		dryRun = options.dryRun;
	}
	if (typeof options.recurseInDirectories === "undefined") {
		var recurseInDirectories = false;
	} else {
		recurseInDirectories = options.recurseInDirectories;
	}
	if (!options.compareWith) {
		options.compareWith = new Date();
	}
	var handleDirectoryListing = function (error, listing) {
		listing.forEach(function (filename) {
			var filePath = path + '/' + filename;
			var stat = fs.statSync(filePath);
			checkFile(filePath, stat);
		});
		callback(null, removedMeta);
	}

	var checkFile = function (filePath, stat) {
		if (stat.isFile()) {
			if (comparatorFunction(filePath, stat, options)) {
				var dryRunString = "";
				if (dryRun) {
					dryRunString = " (dryrun)";
				}
				var mtime = moment(stat.mtime);
				var size = stat.size;
				removedMeta.size += size;
				var unit = "bytes";
				if (size > 1048576) {
					size = size / 1048576;
					unit = "mb";
				} else if (size > 1024) {
					size = size / 1024;
					unit = "kb";
				}
				size = Math.round(size * 100) / 100;
				console.log(filePath + " (mtime: " + mtime.format("dddd D.MM.YYYY HH:mm:ss") + ", size: " + size + unit + ")" + dryRunString + ".");
				if (!dryRun) {
					fs.unlinkSync(filePath);
				}
				removedMeta.files += 1;
			}
		} else if (recurseInDirectories && stat.isDirectory()) {
			deleteInDirectory(filePath, comparatorFunction, options);
		}
	}
	path = path.trim();
	path = path.replace(/\/+$/, "");
	fs.readdir(path, handleDirectoryListing);
}
