/**
 * Main Application Window
 */
(function() {
	/**
	 * MainWindowの生成/起動
	 */
	cc1.ui.openApplicationWindow = function() {
		// MapWindowを開く
		var win = cc1.ui.createMapWindow();
		
		// Navigationバーを利用したいのでTabGroupを生成
		cc1.app.tabGroup = Ti.UI.createTabGroup();
		var tab = Ti.UI.createTab({  
		    window: win
		});
		cc1.app.tabGroup.addTab(tab);
		cc1.app.tabGroup.open();
	};
	
	/**
	 * 子画面を開く
	 */
	cc1.ui.openChildWindow = function(win) {
		cc1.app.tabGroup.activeTab.open(win, { animated: true });
	};
})();
