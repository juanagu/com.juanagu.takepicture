var onClose = function(e) {
	$.tp.onClose(e);
};

(function autoInit() {

	var tps = [$.tp, $.tp2, $.tp3];

	var isTp1 = true;
	tps.forEach(function(tp) {
		tp.onOpen({});
		if (isTp1) {
			if (OS_IOS) {
				tp.applyProperties({
					parentWindow : $.index
				});
			}
		}
		isTp1 = false;
	});

})();

if (OS_ANDROID) {
	$.index.open();
} else {
	Ti.UI.iOS.createNavigationWindow({
		window : $.index
	}).open();
}

