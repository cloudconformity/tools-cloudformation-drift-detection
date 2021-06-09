// Logger utilises console
/* eslint-disable no-console */

const consoleLogger = {
	info: console.log,
	error: console.error,
	warn: console.warn
};

const noOpLogger = {
	info: () => {},
	error: () => {},
	warn: () => {}
};

module.exports = (() => {
	const isEnabled = !process.env.DISABLE_LOGS;
	return isEnabled ? consoleLogger : noOpLogger;
})();
