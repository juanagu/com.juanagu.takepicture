# com.juanagu.takepicture
Appcelerator widget, take photo or select to gallery, generate a thumbnail and original image, work for iOS and Android

### Dependency modules and widgets


#### [Required!] Floating button:
https://github.com/juanagu/TiFab

#### [Optional] Resize:
https://github.com/appcelerator-modules/ti.imagefactory

#### [Optional] Android Crop:
https://github.com/m1ga/TiImageCropper/releases/tag/2.0.1 by @m1ga

## Events

#### General

* successImage = When saved the original image.
* error = When an error ocurred trying save the original image.
* successThumbnail = When saved the thumbnail image.
* load:success = When load the image.
* load:error = When don't load the image.

#### Android

* crop:error = Notify an error when crop the image.
* crop:cancel = Notify when user cancel the crop.


## Methods

* applyProperties: set properties for takepicture widget and fab widget.
* setImage: set default image.
* onOpen: Initialize the widget.
* onClose: release the takepicture widget and fab widget.
* cleanup: release the takepicture widget.
* getImagePath: get the original image path.
* getThumbnailPath: get the thumbnail path.



## How use?

Check the sample


#### Donation
###### Do you want to help me? https://www.paypal.me/JuanIgnacioAgu
