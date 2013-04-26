/**
 * Map View Helper
 */
(function() {
	/**
	 * 地図上へ店舗Annotationを表示
	 */
	cc1.ui.MapViewHelper = function() {
		/** Map Object */
		var _map;
		
		/** 現在表示中（表示範囲外含む）のピン */
		var _displayedPins = {};
		
		/** 現在地座標 Lat */
		var _currentLat = null;
		/** 現在地座標 Lng */
		var _currentLng = null;
		
		/** Ti.Map.createAnnotation の Wrapper Function */
		var _createAnnotationFn = null;
		/** 現在地取得中Function */
		var _whenGetLocationFn = null;
		/** 現在地取得終了時Function */
		var _whenFinishGetLocationFn = null;
		
		/** 初期表示位置 */
		var _defaultRegion = {
			latitude: 35.269964,	// 壱番屋本社
			longitude: 136.83777,	// 壱番屋本社
			latitudeDelta: 0.005,
			longitudeDelta: 0.005
		};
		
		/** 表示件数過多メッセージ表示済みフラグ */
		var _showOverMax = false;
		
		/**
		 * 初期化する
		 */
		var initialize = function(obj) {
			// 各種設定
			_map = obj.map;
			_createAnnotationFn = obj.createAnnotationFn;
			_whenGetLocationFn = obj.whenGetLocationFn;
			_whenFinishGetLocationFn = obj.whenFinishGetLocationFn;
			
			// 地図クリック時イベントハンドラ
			_map.addEventListener('click', onClickMapEventHandler);
			
			// 現在地イベント時イベントハンドラ
			Ti.Geolocation.addEventListener("location", function(e) {
				// locationイベント発行時は、現在地の上書きのみ実施する
				// ※locationイベントはGeoLocation利用アプリを起動していると何度も発行される。
				//  その度に地図を移動するとウザいので、移動は現在地取得ボタンを能動的にクリックした
				//  場合だけとし、locationイベント発行時は現在地の上書きのみ行う
				if (!e.success || e.error) {
					// 現在地取得失敗 -> 保存している現在地をクリア
					_currentLat = null;
					_currentLng = null;
				} else {
					// 現在地取得成功 -> 現在地を保存
					_currentLat = e.coords.latitude;
					_currentLng = e.coords.longitude;
				}
			});
		};
		
		/**
		 * MapView初期化時の初期Regionを取得する
		 */
		var getInitialRegion = function() {
			if (!Ti.App.Properties.hasProperty("latestLatitude")) {
				return _defaultRegion;
			} else {
				return {
      				latitude: Ti.App.Properties.getDouble("latestLatitude"),
      				longitude: Ti.App.Properties.getDouble("latestLongitude"),
      				latitudeDelta: Ti.App.Properties.getDouble("latestLatitudeDelta"),
      				longitudeDelta: Ti.App.Properties.getDouble("latestLongitudeDelta")
    			};
			}
		};
		
		/**
		 * 最後に表示した地図領域を保存する
		 */
		var saveLatestRegion = function(region) {
			var fn = function(delta) {
				// [iPhone/BUG?]初期delta値は正しいdelta値を適当な値で割った値を指定しないとうまい縮尺にならない
				if (cc1.ui.viewType === "type1") {
					delta = cc1.round(delta / 7, -4);
					if (delta == 0) delta = 0.0001;
				}
				return delta;
			}
			Ti.App.Properties.setDouble("latestLatitude", cc1.round(region.latitude, -6));
		    Ti.App.Properties.setDouble("latestLongitude", cc1.round(region.longitude, -6));
		    Ti.App.Properties.setDouble("latestLatitudeDelta", fn(region.latitudeDelta));
		    Ti.App.Properties.setDouble("latestLongitudeDelta", fn(region.longitudeDelta));
		};
		
		/**
		 * 現在地を取得する
		 */
		var getCurrentPosition = function() {
			// GeoLocationが無効なら何もしない
			if (Ti.Geolocation.locationServicesEnabled == false) {
				// XXX Analytics
				Ti.App.Analytics.trackEvent('Geo', 'GetCurrentPosition', 'Disable', 1);
				return;
			}
			
			// 現在地取得中Function実行
			_whenGetLocationFn();
			
			// 現在地取得
			Ti.Geolocation.getCurrentPosition(function(e) {
				// 現在地取得は地図移動のみ。現在地(座標)保持はGeoLocation.locationの
				// イベントハンドラで実施している
				if (!e.success || e.error) {
					// 現在地取得失敗 -> 現在表示している地点で検索
					showAnnotationOnMap(_map.region);
					
					// XXX Analytics
					Ti.App.Analytics.trackEvent('Geo', 'GetCurrentPosition', 'Error', 1);
				} else {
					// 現在地取得成功 -> 現在地へ地図を移動＆現在地を設定
					// ※移動するとChangeRegionイベントハンドラにより自動検索
					_currentLat = e.coords.latitude;
					_currentLng = e.coords.longitude;
					_map.setLocation({
						latitude: e.coords.latitude,
						longitude: e.coords.longitude,
					});

					// XXX Analytics
					Ti.App.Analytics.trackEvent('Geo', 'GetCurrentPosition', 'Success', 1);
				}
				
				// 現在地取得終了時Function実行
				_whenFinishGetLocationFn();
			});
		};
		
		/**
		 * 地図上に店舗Annotationを表示する
		 */
		var showAnnotationOnMap = function(region) {
			// 表示地図上の座標
			var lat = parseFloat(region.latitude);
			var lng = parseFloat(region.longitude);
			var latDelta = parseFloat(region.latitudeDelta);
			var lngDelta = parseFloat(region.longitudeDelta);
			var northWestLat = lat + latDelta / 2;
			var northWestLng = lng - lngDelta / 2;
			var southEastLat = lat - latDelta / 2;
			var southEastLng = lng + lngDelta / 2;
			var northWestLatLimit = lat + latDelta * 2;
			var northWestLngLimit = lng - lngDelta * 2;
			var southEastLatLimit = lat - latDelta * 2;
			var southEastLngLimit = lng + lngDelta * 2;
	
			if (isNaN(northWestLat) || isNaN(northWestLng) || isNaN(southEastLat) || isNaN(southEastLng)) {
				return;
			}
			
			// 表示されている範囲のShop情報を取得
			var model = new cc1.model.Shop();
			var shopList = model.list(southEastLat, northWestLat, northWestLng, southEastLng);
			if (shopList.length > 100) {
				if (!_showOverMax) {
					alert("一度に表示できるお店の上限を超えてしまいました。申し訳ありませんが表示範囲を少し絞ってください。");
					_showOverMax = true;
				}
				return;
			} else {
				_showOverMax = false;
			}
			
			for (var i = 0, len = shopList.length; i < len; i++) {
				var shop = shopList[i];
				
				// Annotationを設定
				// ただし既に同じIDを持つAnnotationが存在すれば無視する
				if (!_displayedPins[shop.id]) {
					var pin = _createAnnotationFn({
						latitude: shop.lat,
						longitude: shop.lng,
						title: shop.name,
						subtitle: getDistanceString(_currentLat, _currentLng, shop.lat, shop.lng),	// クリック時も現在地からの距離を再計算
						animate: true,
						_shop: shop		// 店舗詳細Windowへ渡す店舗情報
					});
					
					// AnnotationをMapへ追加
					_map.addAnnotation(pin);
					
					// 現在表示中（表示範囲外含む）Annotationへ追加
					_displayedPins[shop.id] = pin;
				}
			}
			
			// 表示範囲近辺から外れたAnnotationを削除
			for (var id in _displayedPins) {
				if (_displayedPins[id] && 
						(southEastLatLimit > _displayedPins[id].latitude || _displayedPins[id].latitude > northWestLatLimit 
						|| northWestLngLimit > _displayedPins[id].longitude || _displayedPins[id].longitude > southEastLngLimit)) {
					_map.removeAnnotation(_displayedPins[id]);
					_displayedPins[id] = null;
				}
			}
		};
		
		/**
		 * 現在地から緯度経度までの距離(単位文字列を含め)を求める
		 */
		var getDistanceString = function(nowLat, nowLng, shopLat, shopLng) {
			var A = 6378137;
			var RAD = Math.PI / 180;
			
			if (nowLat == null || nowLng == null) {
				return "";
			}
			
			var lat1 = nowLat * RAD;
			var lng1 = nowLng * RAD;
			var lat2 = shopLat * RAD;
			var lng2 = shopLng * RAD;
		
			var lat_c = (lat1 + lat2) / 2;
			var dx = A * (lng2 - lng1) * Math.cos(lat_c);
			var dy = A * (lat2 - lat1);
		
			var retM = Math.round(Math.sqrt(dx * dx + dy * dy));
			
			if (retM < 1000) {
				return '現在地からおおよそ' + cc1.round(retM, 1) + 'm';
			} else if (retM < 10000) {
				return '現在地からおおよそ' + cc1.round(retM / 1000, -1) + 'km';
			} else {
				return '現在地からおおよそ' + cc1.round(retM / 1000) + 'km';
			}
		}
		
		/**
		 * 地図クリック時イベントハンドラ
		 */
		var onClickMapEventHandler = function(e) {
			// Ti.API.debug(e.clicksource);
			var shop;
			if (e.clicksource == 'pin') {
				// ピンがクリックされた：現在地からの距離を再取得
				shop = e.annotation._shop;
				e.annotation.subtitle = getDistanceString(_currentLat, _currentLng, shop.lat, shop.lng);
				
				// XXX Analytics
				Ti.App.Analytics.trackEvent('Map', 'Pin', 'Click', 1);
			} else if (e.clicksource == 'rightButton' || e.clicksource == 'rightPane') {
				// 右ボタンクリックがクリックされた：Annotationに設定された店舗情報を開く
				shop = e.annotation._shop;
				var win = cc1.ui.createShopDetailWindow(shop);
				cc1.ui.openChildWindow(win);
			}
		};
		
		/**
		 * publicオブジェクト
		 */
		return {
			initialize: initialize,
			getInitialRegion: getInitialRegion,
			saveLatestRegion: saveLatestRegion,
			getCurrentPosition: getCurrentPosition,
			showAnnotationOnMap: showAnnotationOnMap
		};
	}
})();
