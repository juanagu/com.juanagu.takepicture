/**
 * @author jagu
 * Android add in Manifest :  <uses-permission android:name="android.android.permission.CAMERA"/>
 * for crop se.hyperlab.imagecropper v > 2.0.1 is required -> install run in your root "gittio install se.hyperlab.imagecropper"
 * iOS, add in plist :
 * 				<!-- Permissions -->
 <key>NSCameraUsageDescription</key>
 <!-- your description -->
 <string/>
 <key>NSPhotoLibraryUsageDescription</key>
 <!-- your description -->
 <string/>
 <key>NSPhotoLibraryAddUsageDescription</key>
 <!-- your description -->
 <string/>

 General:
 * ti.imagefactory is required to resize the image -> install run in your root "gittio install ti.imagefactory"

 */

/** ------------------------
 Constants
 ------------------------**/
var TAG = 'com.juanagu.take.picture';
var PATH = OS_ANDROID ? Titanium.Filesystem.getApplicationCacheDirectory() : Titanium.Filesystem.getApplicationDataDirectory();
var EXTENSION = '.jpg';
var THUMBNAIL_EXTENSION = "_thumbnail";
if (OS_IOS) {
	var parentWindow = null;
}

/** ------------------------
 Fields
 ------------------------**/
// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var args = $.args;

var thumbnailPath = null;
var imagePath = null;
var name = 'my_base_name';

//image sizes
var imageMaxSize = 1080;
var imageWidth = null;
var imageHeight = null;

//thumbnail sizes
var thumbnailMaxSize = 800;
var thumbnailWidth = null;
var thumbnailHeight = null;

var editMode = true;

var debounceTime = 1000;

var allowEditing = true;

var fab = OS_ANDROID ? $.fab : null;

var options = {
	showControls : OS_IOS,
	saveToPhotoGallery : false,
	mediaTypes : [Ti.Media.MEDIA_TYPE_PHOTO],
	autohide : true,
	allowEditing : allowEditing,
	animated : OS_ANDROID,
	success : function(e) {
		onSuccess(e);
	},
	cancel : function(e) {
		onCancel(e);
	},
	error : function(e) {
		onError(e);
	}
};

if (OS_IOS) {
	var iOSFabStyle = {
		right : 0,
		bottom : 0,
		backgroundColor : 'transparent',
		touchEnabled : true,
		icon : {
			image : WPATH('images/ic_photo_camera_white.png')
		}
	};
};
/** ------------------------
 Methods
 ------------------------**/
/**
 * apply properties to controller
 * @param {Object} properties
 */
var applyProperties = function(properties) {
	if (_.isObject(properties)) {

		if (_.has(properties, 'options')) {
			_.extend(options, properties.options);
		}

		if (_.has(properties, 'name')) {
			name = properties.name;
		}

		if (_.has(properties, 'imagePath')) {
			setImagePath(properties.imagePath);
		}

		if (_.has(properties, 'thumbnailPath')) {
			setThumbnailPath(properties.thumbnailPath);
		}

		if (_.has(properties, 'imageMaxSize')) {
			imageMaxSize = properties.imageMaxSize;
		}

		if (_.has(properties, 'thumbnailMaxSize')) {
			thumbnailMaxSize = properties.thumbnailMaxSize;
		}

		if (_.has(properties, 'editMode')) {
			editMode = properties.editMode;
		}

		if (_.has(properties, 'allowEditing')) {
			allowEditing = properties.allowEditing;
		}

		if (_.has(properties, 'image')) {
			_.extend($.image, _.omit(properties.image, 'image'));
		}
		if (_.has(properties, 'container_general')) {
			_.extend($.container_general, properties.container_general);
		}
		if (_.has(properties, 'container_image')) {
			_.extend($.container_image, properties.container_image);
		}
		if (_.has(properties, 'icon_empty')) {
			_.extend($.icon_empty, properties.icon_empty);
		}

		if (OS_ANDROID && _.has(properties, 'fab')) {
			$.fab.applyProperties(properties.fab);
		}

		if (OS_IOS && _.isNull(fab) && _.has(properties, 'ios')) {
			if (properties.ios.withFab) {
				if (_.has(properties.ios, 'fab')) {
					_.extend(iOSFabStyle, properties.ios.fab);
				} else if (_.has(properties, 'fab')) {
					_.extend(iOSFabStyle, properties.fab);
				}
				addFABiOS();

			}
		}

		if (OS_IOS && _.isNull(fab) && _.has(properties, 'parentWindow')) {
			parentWindow = properties.parentWindow;
			configureRightNavButton();
		}

		_.extend($.widget, _.omit(properties, 'options', 'imagePath', 'thumbnailPath', 'name', 'fab', 'imageMaxSize', 'thumbnailMaxsize', 'editMode', 'parentWindow', 'allowEditing', 'image', 'container_general', 'container_image', 'icon_empty', 'ios'));
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

	$.image.addEventListener('click', onClickImage);
	$.image.addEventListener('load', downloadSuccess);
	$.image.addEventListener('error', downloadError);

	if (editMode && fab) {
		fab.on('click', onClickCamera);
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
	//PreventDetachedView
	_.delay(updateUI, 100);
};

/** ------------------------
 Listeners
 ------------------------**/
/**
 *
 */

/**
 * when window is opened
 */
var onOpen = function(e) {
	init();
	if (fab) {
		fab.onOpen(e);
	}
};

/**
 * when window is closed
 * @param {Object} e
 */
var onClose = function(e) {
	cleanup();
	if (fab) {
		fab.onClose(e);
	}
};

/**
 * Fired as soon as the device detects a touch gesture.
 * @param {Object} e
 */
var onTouchStart = function(e) {

};

/**
 * when user clicked in camera
 * @param {Object} e
 */
var onClickCamera = _.debounce(function(e) {
	if (editMode) {
		$.trigger('click:camera', e);
		openOptionDialog();
	}
}, debounceTime, true);

/**
 * when user clicked in image
 * @param {Object} e
 */
var onClickImage = _.debounce(function(e) {
	$.trigger('click:image', e);
	if (_.isString(imagePath)) {
		Widget.createController('win_zoom', {
			image : {
				image : imagePath
			}
		}).getView().open();
	}
}, debounceTime, true);

/**
 * open option dialog with options camera or gallery
 */
var openOptionDialog = function() {
	var dialog = Titanium.UI.createOptionDialog({
		//title of dialog
		title : L('select_source', 'Select source'),
		//options
		options : [L('camera', 'Camera'), L('gallery', 'Gallery'), L('cancel', 'Cancel')],
		//index of cancel button
		cancel : 2
	});

	dialog.addEventListener('click', onClickOptionDialog);
	dialog.show();
	//gc
	dialog = null;
};

/**
 * when user clicked in option dialog
 * @param {Object} e
 */
var onClickOptionDialog = function(e) {
	switch(e.index) {
	case 0:
		openCamera();
		break;
	case 1:
		openGallery();
		break;
	}
};

/**
 * open device camera
 */
var openCamera = function() {
	var hasCameraPermissions = Ti.Media.hasCameraPermissions();
	if (hasCameraPermissions) {
		Titanium.Media.showCamera(options);
	} else {
		Ti.Media.requestCameraPermissions(function(e) {
			if (e.success) {
				Titanium.Media.showCamera(options);
			}
		});
	}

};

/**
 * open device gallery
 */
var openGallery = function() {
	Titanium.Media.openPhotoGallery(options);
};

/**
 * on success take picture
 * @param {Object} e
 */
var onSuccess = function(e) {
	$.trigger('success', e);
	showLoader();

	if (OS_ANDROID && allowEditing) {
		crop(e.media);
	}
	_.defer(saveImage, e.media);
};

/**
 * on cancel take picture
 * @param {Object} e
 */
var onCancel = function(e) {
	$.trigger('cancel', e);
};

/**
 * on error take picture
 * @param {String} e
 */
var onError = function(e) {
	$.trigger('error', e);
};

var crop = function(media) {

	try {

		var imageCropper = require('se.hyperlab.imagecropper');

		imageCropper.open({
			image : media,
			aspect_x : 1,
			aspect_y : 1,
			size : imageMaxSize,
			error : function(e) {
				$.trigger('crop:error', e);
			},
			success : function(e) {
				saveImage(e.image);
			},
			cancel : function(e) {
				$.trigger('crop:cancel', e);
			}
		});
	} catch(ex) {
		Ti.API.error(TAG, 'se.hyperlab.imagecropper is required to crop on Android');
		//save without crop
		saveImage(media);
	}
};

/**
 * save image in locale storage and create a thumbnail
 * @param {TiBlob} media
 */
var saveImage = function(media) {
	calculateSize(media.width, media.height);
	try {

		var ImageFactory = require('ti.imagefactory');

		media = ImageFactory.imageAsResized(media, {
			width : imageWidth,
			height : imageHeight
		});

	} catch(e) {
		Ti.API.error(TAG, 'resize error, ti.imagefactory is required');
	}

	try {
		var f = Titanium.Filesystem.getFile(PATH, name + EXTENSION);
		f.write(media);
		setImagePath(f.nativePath);

		$.trigger('successImage', {
			path : f.nativePath
		});
		saveThumbnail(media);
	} catch(error) {
		Ti.API.error(TAG, 'save image error -> ' + error);
		$.trigger('error', {
			error : error
		});
	}
};

/**
 * resize image and save thumbnail
 * @param {TiBlob} media
 */
var saveThumbnail = function(media) {
	var f = Titanium.Filesystem.getFile(PATH, name + THUMBNAIL_EXTENSION + EXTENSION);
	try {

		var ImageFactory = require('ti.imagefactory');
		f.write(ImageFactory.imageAsResized(media, {
			width : thumbnailWidth,
			height : thumbnailHeight
		}));

		//gc
		ImageFactory = null;

	} catch(e) {

		var resize = (Titanium.UI.createImageView({
				width : thumbnailWidth,
				height : thumbnailHeight,
				image : imagePath,
				autorotate : true
			})).toImage();

		f.write( OS_ANDROID ? resize.media : resize);

	}

	setThumbnailPath(f.nativePath);

	$.trigger('successThumbnail', {
		path : f.nativePath
	});

	hideLoader();
};

/**
 * calculate size to image and thumbnail
 * @param {Integer} realWidth
 * @param {Integer} realHeight
 */
var calculateSize = function(realWidth, realHeight) {

	//calculate size to image
	var sizeToImage = calculateSizeToMaxSize(realWidth, realHeight, imageMaxSize);
	imageWidth = sizeToImage.width;
	imageHeight = sizeToImage.height;

	//calculate size to thumbnail
	var sizeToThumbnail = calculateSizeToMaxSize(realWidth, realHeight, thumbnailMaxSize);
	thumbnailWidth = sizeToThumbnail.width;
	thumbnailHeight = sizeToThumbnail.height;
};

/**
 *
 * calculate size depending maxSize
 * @param {Integer} realWidth
 * @param {Integer} realHeight
 * @param {Integer} maxSize
 * @return {Object} {width:N,height:M}
 *
 */
var calculateSizeToMaxSize = function(realWidth, realHeight, maxSize) {
	var result = {
		width : realWidth,
		height : realHeight
	};
	//valido si es necesario realizar un resize
	if (realWidth > maxSize || realHeight > maxSize) {
		//si width y height son iguales le seteo a los dos el tamaño maximo permitido
		if (realWidth == realHeight) {
			result.width = maxSize;
			result.height = maxSize;
		}
		//si width es mayor a height seteo width como tamaño mayor y calculo height teniendo en cuenta el porcentaje de width que tuve que reducir
		else if (realWidth > realHeight) {

			var percent = (maxSize * 100) / realWidth;
			result.width = maxSize;
			result.height = (percent * realHeight ) / 100;

		}
		//se realiza el mismo calculo que arriba pero invirtiendo parametros
		else {

			var percent = (maxSize * 100) / realHeight;
			result.height = maxSize;
			result.width = (percent * realWidth ) / 100;

		}
	}
	return result;
};

/**
 * set image path
 * @param {String} path
 */
var setImagePath = function(path) {
	imagePath = path;
};

/**
 * set thumbnail path
 * @param {String} path
 */
var setThumbnailPath = function(path) {
	thumbnailPath = path;
	setImage(thumbnailPath);
};

/**
 * get image path
 * @return {String}
 */
var getImagePath = function() {
	return imagePath;
};

/**
 * get thumbnail path
 * @return {String}
 */
var getThumbnailPath = function() {
	return thumbnailPath;
};

/**
 * set image to show
 */
var setImage = function(img) {
	if (!_.isNull(img)) {
		$.image.hide();
		$.icon_empty.hide();
		$.loader.show();

		if ($.image.image == img) {
			$.image.image = null;
		}

		$.image.setImage(img);

	} else {
		$.icon_empty.show();
	}
};

/**
 * show loader
 */
var showLoader = function() {
	$.loader.show();
	$.icon_empty.hide();
};

/**
 * hide loader
 */
var hideLoader = function() {
	$.loader.hide();
};

/**
 * update UI
 */
var updateUI = function() {
	if (!editMode) {
		if (fab) {
			fab.applyProperties({
				visible : false
			});
		} else if (OS_IOS && !_.isNull(parentWindow)) {
			parentWindow.setRightNavButton(null);
		}

	}
	//GC
	parentWindow = null;
};

if (OS_IOS) {
	var configureRightNavButton = function() {
		var btnCamera = Titanium.UI.createButton({
			title : L('take_picture', 'Take picture'),
			systemButton : Titanium.UI.iOS.SystemButton.CAMERA,
		});

		btnCamera.addEventListener('click', onClickCamera);

		parentWindow.setRightNavButton(btnCamera);
		//GC
		btnCamera = null;
	};

}

if (OS_IOS) {
	var addFABiOS = function() {
		if (_.isNull(fab)) {
			fab = Alloy.createWidget('com.juanagu.fab', iOSFabStyle);
			$.container_general.add(fab.getView());
		}
	};
}

var downloadSuccess = function() {
	$.trigger('load:success');
	$.loader.hide();
	$.image.show();
};

var downloadError = function() {
	$.trigger('load:error');
	$.image.hide();
	$.icon_empty.show();
};
/** ------------------------
 Integration with Widgets.nlFokkezbForms
 ------------------------**/

if (args.nlFokkezbForms) {

	exports.baseController = '../widgets/nl.fokkezb.form/controllers/field';
	$.__widgetId = 'takepicture.fields';

	$.focus = focus;
	$.getValue = getValue;
	$.setValue = setValue;
	$.isValid = isValid;

	/**
	 * Constructor.
	 *
	 * @constructor
	 * @method Controller
	 * @param args Arguments which will also be used to call {@link Widgets.nlFokkezbForm.controllers.field#Controller}.
	 * @param {Object} [args.input] Properties to apply to the `Ti.UI.Switch`.
	 * @param {Boolean} [args.value=false] Set to `true` to turn the switch on.
	 */
	(function constructor(args) {
		onOpen({});
		// add the input to the row
		$.setInput($.widget);

	})(arguments[0]);

	function focus() {
		//nothing
	}

	function getValue() {
		return getImagePath();
	}

	function setValue(val) {
		setImage(val);
	}

	function isValid() {
		return _.isString(imagePath) && !_.isEmpty(imagePath);
	}

	function onChange() {
		$.change();
	}

}

/** ------------------------
 public
 ------------------------**/
exports.applyProperties = applyProperties;
exports.onOpen = onOpen;
exports.onClose = onClose;
exports.cleanup = cleanup;
exports.getImagePath = getImagePath;
exports.getThumbnailPath = getThumbnailPath;
exports.setImage = setImage;

