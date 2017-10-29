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

	//set default image for tp2
	$.tp2.setImage('https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Appcelerator_logo.svg/220px-Appcelerator_logo.svg.png');

})();

var form = Alloy.createWidget('nl.fokkezb.form', {
	fieldsets : [{
		legend : 'Test Integration with forms',
		fields : [{
			name : 'name',
			label : 'Your name',
			type : 'text'
		}, {
			name : 'email',
			label : 'Your email address',
			type : 'text',
			format : 'email'
		}, {
			name : 'like',
			label : 'Do you like it?',
			type : 'switch'
		}, {
			name : 'photo',
			label : 'photo',
			widget : 'com.juanagu.takepicture',
			type : {
				nlFokkezbForms : true,
				ios : {
					withFab : true,
					fab : {
						icon : {
							image : '/images/ic_photo_camera_black.png'
						}
					}
				}
			}
		}]
	}]
});
$.scroll.add(form.getView());

if (OS_ANDROID) {
	$.index.open();
} else {
	Ti.UI.iOS.createNavigationWindow({
		window : $.index
	}).open();
}

