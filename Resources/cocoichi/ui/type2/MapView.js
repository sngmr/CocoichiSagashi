/**
 * Map View
 */
(function() {
	/** MapHelperObject */
	var mapHelper = null;
	
	/**
	 * Create Map Window
	 */
	cc1.ui.createMapWindow = function() {
		// MapHelper初期化
		mapHelper = new cc1.ui.MapViewHelper();
		
		// Window
		var win = Ti.UI.createWindow({
			navBarHidden: true,
			fullscreen: true
		});
		
		// ヘッダー
		var header = Ti.UI.createView({
			width: "100%",
			height: "40dp",
			top: "0dp",
			left: "0dp",
			backgroundColor: "#6D2D1C"
		});
		
		// ヘッダータイトル
		var headerImage = Ti.UI.createImageView({
			image: cc1.ui.getImageFile("titlelogo.png"),
			width: "130dp",
			height: "25dp"
		});
		header.add(headerImage);
		
		// TODO 押した事によるリアクションがない
		// 現在地ボタン（標準時&現在地取得中）
		var positionButton = Ti.UI.createButton({
			title: "",
			image: cc1.ui.getImageFile("position.png"),
			width: "24dp",
			height: "24dp",
			right: "5dp"
		});
		// var positionActivity = Ti.UI.createActivityIndicator({
			// width: 33,	// 現物位置合わせ
	        // style:Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN
		// });
		header.add(positionButton);
		
		win.add(header);
		
		// TODO ピンとか立ててる時にMapが読み込まれない？
		// TODO 現在地のぼっちが表示されない
		// 地図初期化
		var map = Ti.Map.createView({
			top: "40dp",
			mapType: Titanium.Map.STANDARD_TYPE,
			region: mapHelper.getInitialRegion(),
			animate: true,
			regionFit: true,
			userLocation: true,
			annotations: []
		});
		win.add(map);
		
		// ヘルパー初期化
		mapHelper.initialize({
			map: map,
			createAnnotationFn: function(obj) {
				obj.image = cc1.ui.getImageFile("pin.png");
				obj.rightButton = cc1.ui.getImageFile("more.png");
				return Ti.Map.createAnnotation(obj);
			},
			// TODO Android版の現在地取得中を考える
			whenGetLocationFn: function() { 
				// win.setRightNavButton(positionActivity);
				// positionActivity.show(); 
			},
			whenFinishGetLocationFn: function() {
				// positionActivity.hide();
				// win.setRightNavButton(positionButton);
			}
		});
		
		// イベント登録
		map.addEventListener("regionChanged", function(e) {
			// 初期化終了後のみ最終表示位置を変更する
			mapHelper.saveLatestRegion(e);
			mapHelper.showAnnotationOnMap(e);
		});
		positionButton.addEventListener("click", function() {
			mapHelper.getCurrentPosition();
		});

		// 現在地取得
		mapHelper.getCurrentPosition();

		return win;
	};
})();
