var moment = require('moment');

module.exports = function (path, stat, options) {
	var measurement = options.thresholdMeasurememt || 'days';
	var diff = moment(options.compareWith).diff(moment(stat.ctime), measurement);
	return (diff > options.threshold);
}
