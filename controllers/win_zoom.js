/** ------------------------
 Fields
 ------------------------**/
// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

/** ------------------------
 Methods
 ------------------------**/
/**
 * apply properties to controller
 * @param {Object} properties
 */
var applyProperties = function(properties) {
	if (_.isObject(properties)) {
		if (_.has(properties, 'image')) {
			_.extend($.image, properties.image);
		}
	}
};

/**
 * http://www.tidev.io/2014/09/18/cleaning-up-alloy-controllers/
 */
var cleanup = function() {
	// let Alloy clean up listeners to global collections for data-binding
	// always call it since it'll just be empty if there are none
	$.destroy();
	// remove all event listeners on the controller
	$.off();
};

/**
 * apply listeners to controller
 */
var applyListeners = function() {
	if(OS_IOS){
		$.btn_back.addEventListener('click', onBack);
	}
};

/**
 * initialize controller
 */
var init = function() {
	applyProperties(args);
	applyListeners();
	//gc
	args = null;
};

/** ------------------------
 Listeners
 ------------------------**/

/**
 * when window is opened
 */
var onOpen = function(e) {
	_.defer(init);

};

/**
 * when window is closed
 * @param {Object} e
 */
var onClose = function(e) {
	cleanup();
};

var onBack=function(){
	$.win_zoom.close();
};
/** ------------------------
 public
 ------------------------**/
exports.applyProperties = applyProperties;
exports.cleanup = cleanup;
