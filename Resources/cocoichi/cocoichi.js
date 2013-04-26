/**
 * メイン
 */
var cc1 = {};

// バージョン設定
cc1.VERSION = "2.2";

(function() {
	// Titanium各種Object/State保管用
	cc1.app = {};
	
	// 共通設定	
	Ti.Geolocation.purpose = "お近くのココイチを探します";
	Ti.UI.setBackgroundColor('#000');
	
	// デバッグフラグ
	cc1._debug = false;
	
	// データベース設定
	Ti.include('model/database.js');
	cc1.database.setup();
	
	// Setup Google Analytics
	setupAnalytics();
	
	/**
	 * 小数点を考慮した四捨五入
	 */
	cc1.round = function(num, point) {
		if (isNaN(num) && isNaN(point)) {
			return NaN;
		}
 		if (!point) {
 			return Math.round(num);
 		}
 		var place = Number('1e+' + Math.abs(point));
 		if (point > 0) {
 			num = Math.round(Math.floor((num / place) * 10) / 10) * place;
 		} else if (point < 0) {
 			num = Math.round(num * place) / place;
 		}
 		return num;
 	}
 	
 	/**
 	 * Google Analytics Setup
 	 */
 	function setupAnalytics() {
 		// TODO なーんか遅いからGA外してみる
 		if (cc1._debug || true) {
 			// Define empty method
			Ti.App.Analytics = {
				trackPageview: function(pageUrl) {},
				trackEvent: function(category, action, label, value) {}
			}
		} else {
			Ti.include('lib/analytics.js');
			var analytics = new Analytics('UA-00000000000-1');	// 置き換えてね
			
			Ti.App.addEventListener('analytics_trackPageview', function(e){
				analytics.trackPageview(Ti.Platform.osname + '/' + e.pageUrl);
			});
			Ti.App.addEventListener('analytics_trackEvent', function(e){
				analytics.trackEvent(e.category, e.action, e.label, e.value);
			});
			
			Ti.App.Analytics = {
				trackPageview: function(pageUrl) {
					Ti.App.fireEvent('analytics_trackPageview', {pageUrl:pageUrl});
				},
				trackEvent: function(category, action, label, value) {
					Ti.App.fireEvent('analytics_trackEvent', {category:category, action:action, label:label, value:value});
				}
			}
			
			analytics.start(10);
		}
 	}
})();

Ti.include(
	'ui/ui.js',
	'model/model.js'
);
