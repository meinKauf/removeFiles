var fs = require('fs');

var deleteInDirectory = module.exports = function (path, comparatorFunction, options) {
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
			fs.stat(filePath, function (error, stat) {
				if (error) {
					return console.error(error);
				}
				checkFile(filePath, stat);
			});
		});
	}

	var checkFile = function (filePath, stat) {
		if (stat.isFile()) {
			if (comparatorFunction(filePath, stat, options)) {
				var dryRunString = "";
				if (dryRun) {
					dryRunString = " (dryrun)";
				}
				console.log("Deleting '" + filePath + "'" + dryRunString + ".");
				if (!dryRun) {
					fs.unlink(filePath, function (error) {
						if (error) {
							console.error(error);
						}
					});
				}
			}
		} else if (recurseInDirectories && stat.isDirectory()) {
			deleteInDirectory(filePath, comparatorFunction, options);
		}
	}
	path = path.trim();
	path = path.replace(/\/+$/,"");
	fs.readdir(path, handleDirectoryListing);

}
