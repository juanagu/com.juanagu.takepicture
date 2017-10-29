var onClose = function(e) {
	$.tp.onClose(e);
};

(function autoInit() {

	var tps = [$.tp, $.tp2, $.tp3];

	tps.forEach(function(tp) {
		tp.onOpen({});
		if (OS_IOS) {
			tp.applyProperties({
				parentWindow : $.index
			});
		}
	});

})();

if (OS_ANDROID) {
	$.index.open();
} else {
	Ti.UI.iOS.createNavigationWindow({
		window : $.index
	}).open();
}

