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
		mapHelper = cc1.ui.MapViewHelper();
		
		// Window初期化
		var win = Ti.UI.createWindow({
			barColor: '#6D2D1C',
			title: 'CoCo壱探し',
			tabBarHidden: true
		});
		
		// 現在地取得ボタン（標準時&現在地取得最中時）
		var positionButton = Ti.UI.createButton({
			style: Ti.UI.iPhone.SystemButtonStyle.BORDERED,
			image: '/cocoichi/image/location.png'
		});
		var positionActivity = Ti.UI.createActivityIndicator({
			width: 33,	// 現物位置合わせ
	        style:Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN
		});
		win.setRightNavButton(positionButton);

		// 地図初期化
		var map = Ti.Map.createView({
			mapType: Titanium.Map.STANDARD_TYPE,
			region: mapHelper.getInitialRegion(),
			animate: true,
			regionFit: true,
			userLocation: true,
			annotations: []
		});
		win.add(map);
		
		// 地図初期化時、複数回のregionChangedイベントが発生してしまうため、
		// 適当な時間経過後のregionChangedイベントから有効とみなす
		map._initComplete = false;
		setTimeout(function() {
			map._initComplete = true;
		}, 1000);
		
		// ヘルパー初期化
		mapHelper.initialize({
			map: map,
			createAnnotationFn: function(obj) {
				obj.rightButton = Ti.UI.iPhone.SystemButton.DISCLOSURE;
				return Ti.Map.createAnnotation(obj);
			},
			whenGetLocationFn: function() { 
				win.setRightNavButton(positionActivity);
				positionActivity.show(); 
			},
			whenFinishGetLocationFn: function() {
				positionActivity.hide();
				win.setRightNavButton(positionButton);
			}
		});
		
		// イベント登録
		map.addEventListener('regionChanged', function(e) {
			if (e.source._initComplete) {
				// 初期化終了後のみ最終表示位置を変更する
				mapHelper.saveLatestRegion(e);
			}
			mapHelper.showAnnotationOnMap(e);
		});
		positionButton.addEventListener('click', function() {
			mapHelper.getCurrentPosition();
		});

		// 現在地取得
		mapHelper.getCurrentPosition();
		
		// XXX Analytics
		win.addEventListener('focus', function(e) {
			Ti.App.Analytics.trackPageview('Map');
		});
		positionButton.addEventListener('click', function() {
			Ti.App.Analytics.trackEvent('Geo', 'GetCurrentPosition', 'Click', 1);
		});

		return win;
	};
})();
