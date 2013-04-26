/**
 * 店舗情報Model
 */
(function() {
	/** 列名 */
	var fieldNames = [
		'id',
		'gnavi_id',
		'cocoichi_id',
		'name',
		'address',
		'lat',
		'lng',
		'tel',
		'opening_hour',
		'opening_hour_open',
		'opening_hour_close',
		'closed',
		'number_of_chair',
		'number_of_parking',
		'flag',
		'etc'
	];

	// flatビット演算用定数
	var FLAG_PARKING = 1;
	var FLAG_24H = 2;
	var FLAG_NEW = 4;
	var FLAG_DELIVERY = 8;
	var FLAG_CHILD = 16;
	var FLAG_DORIA = 32;
	var FLAG_WIFI = 64;
	var FLAG_DRIVE = 128;
	var FLAG_HASHED = 256;
	var FLAG_TEPPAN = 512;
	
	cc1.model.Shop = function() {
		/**
		 * 店舗情報検索
		 */
		this.list = function(southEastLat, northWestLat, northWestLng, southEastLng) {
			
			//Ti.API.debug('SE-lat:' + southEastLat + ',NW-lat:' + northWestLat + ',NW-lng:' + northWestLng + ',SE-lng:' + southEastLng);
			
			var rows = [];
			var sql = 
				"SELECT * FROM shop " + 
				"WHERE " + 
					"'" + southEastLat + "' <= lat AND lat <= '" + northWestLat + "' AND " +
					"'" + northWestLng + "' <= lng AND lng <= '" + southEastLng + "'";
			
			var rs = cc1.model.db.execute(sql);
			while (rs.isValidRow()) {
				var row = cc1.model.populate(rs, fieldNames);
				
				row.flag_string = getFlagString(row.flag);
				
				rows.push(row);
				rs.next();
			}
			
			return rows;
		};
	};
	
	/**
	 * flag値の文字列表現を取得
	 */
	function getFlagString(flag) {
		var flagValue = "";
		if ((flag & FLAG_PARKING) != 0) flagValue += "駐車場あり\n";
		if ((flag & FLAG_24H) != 0) flagValue += "24時間営業\n";
		if ((flag & FLAG_NEW) != 0) flagValue += "新型店舗\n";
		if ((flag & FLAG_DELIVERY) != 0) flagValue += "宅配あり\n";
		if ((flag & FLAG_CHILD) != 0) flagValue += "キッズメニューあり\n";
		if ((flag & FLAG_DORIA) != 0) flagValue += "ドリア取扱\n";
		if ((flag & FLAG_WIFI) != 0) flagValue += "WiFi設置店舗\n";
		if ((flag & FLAG_DRIVE) != 0) flagValue += "ドライブスルーあり\n";
		if ((flag & FLAG_HASHED) != 0) flagValue += "ハッシュドビーフ取扱\n";
		if ((flag & FLAG_TEPPAN) != 0) flagValue += "鉄板カレー取扱\n";
		
		// 最後の改行を消す
		if (flagValue.length > 0) {
			flagValue = flagValue.substring(0, flagValue.length - 1);
		}
		return flagValue;
	};
})();
