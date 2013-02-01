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
	}

	var checkFile = function (filePath, stat) {
		if (stat.isFile()) {
			if (comparatorFunction(filePath, stat, options)) {
				var dryRunString = "";
				if (dryRun) {
					dryRunString = "(dryrun) ";
				}
				var mtime = moment(stat.mtime);
				var ctime = moment(stat.ctime);
				var size = stat.size;
				removedMeta.size += size;
				var unit = "byte";
				if (size > 1073741824) {
					size = size / 1073741824;
					unit = "GB"
				} else if (size > 1048576) {
					size = size / 1048576;
					unit = "MB";
				} else if (size > 1024) {
					size = size / 1024;
					unit = "kB";
				}
				size = Math.round(size * 100) / 100;
				console.log(dryRunString + filePath + "\n\tmtime: " + mtime.format("dddd D.MM.YYYY HH:mm:ss") + ",\n\tctime: " + ctime.format("dddd D.MM.YYYY HH:mm:ss") + ",\n\tsize: " + size + unit + ".");
				if (!dryRun) {
					fs.unlinkSync(filePath);
				}
				removedMeta.files += 1;
			}
		} else if (recurseInDirectories && stat.isDirectory()) {
			deleteInDirectory(filePath, comparatorFunction, options, function (error, meta) {
				removedMeta.size += meta.size;
				removedMeta.files += meta.files;
			});
		}
	}
	path = path.trim();
	path = path.replace(/\/+$/, "");
	var listing = fs.readdirSync(path);
	handleDirectoryListing(null, listing);
	callback(null, removedMeta);
}
