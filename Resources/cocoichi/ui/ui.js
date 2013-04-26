/**
 * UI Root
 */
(function() {
	// ui用名前空間
	cc1.ui = {};
	
	// UIタイプ取得
	cc1.ui.viewType = 'type1';
	if (Ti.Platform.osname.toLowerCase() == "iphone") {
		cc1.ui.viewType = 'type1';
	} else if (Ti.Platform.osname.toLowerCase() == "android") {
		cc1.ui.viewType = 'type2';
	}
	
	/**
	 * イメージファイルを取得する
	 */
	cc1.ui.getImageFile = function(fileName) {
		return "/cocoichi/image/" + fileName;
	};
	
})();

Ti.include(
	'MapViewHelper.js',
	cc1.ui.viewType + '/ApplicationWindow.js',
	cc1.ui.viewType + '/MapView.js',
	cc1.ui.viewType + '/ShopDetailView.js'
);

// Let's roll, really!!
cc1.ui.openApplicationWindow();
