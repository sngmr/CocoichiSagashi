/**
 * Main Application Window
 */
(function() {
	/**
	 * MainWindowの生成/起動
	 */
	cc1.ui.openApplicationWindow = function() {
		// MapWindowを開く
		cc1.app.mapWindow = cc1.ui.createMapWindow();
		cc1.app.mapWindow.open();
	};
	
	/**
	 * 子画面を開く
	 */
	cc1.ui.openChildWindow = function(win) {
		// TODO Backボタンで不明なWindowが一つはさまる。なんだろ？
		if (cc1.app.detailWindow) {
			// 一旦閉じといた方が捗るらしい
			cc1.app.detailWindow.close();
			cc1.app.detailWindow = null;
		}
		cc1.app.detailWindow = win;
		
		// Create Animation(効いてるか分からん)
		var animation = Ti.UI.createAnimation({
			width: Ti.Platform.displayCaps.platformWidth,
			height: Ti.Platform.displayCaps.platformHeight,
			duration: 300
		});
		
		cc1.app.detailWindow.open(animation);
	};
})();
