/**
 * Database
 * ※匿名関数内でオブジェクトを作って、そのオブジェクトをreturnするコードの書き方を試してみる
 */
cc1.database = (function() {
	var DB_NAME = 'cocoichi';
	
	function getDatabaseFile() {
		// iOSとAndroidでファイル名取得方法が異なる
		var db = Ti.Database.open(DB_NAME);
		var dbFile = db.getFile();
		db.close();
		return dbFile;
	}
	
	/**
	 * Database API
	 */
	var api = {};
	
	/**
	 * Database instance (Set instance in setup method)
	 */
	api.db = null;
	
	/**
	 * Setup database
	 */
	api.setup = function() {
		// 現在のバージョンをプロパティから取得（稼働無しの場合は空）
		var version = Ti.App.Properties.getString('version');
		
		if (!version || version != cc1.VERSION) {
			// DBファイルを取得（この段階で既に存在している）
			var dbFile = getDatabaseFile();
			if (dbFile.exists()) {
				// HACK: iOSシミュレータの場合、installをやるとApplicationDataDirectoryに
				// 実体へのシンボリックリンクが出来るだけで、毎回Resources以下のDBファイルを使っている。
				// 消してしまうとResources以下のDBが消えるので何もしない
				if (Ti.Platform.model != "Simulator" && Ti.Platform.model != "x86_64") {
					dbFile.deleteFile();
				}
			}
		}
		
		// DBを開く
		// ※instalメソッドは既にDBファイルが存在すれば何もしない。つまり存在しない場合か消された場合のみコピーされる
		api.db = Ti.Database.install('cocoichi.sqlite', DB_NAME);
		
		// 現在のバージョンをプロパティへ設定
		Ti.App.Properties.setString('version', cc1.VERSION);
	};
	
	return api;
}());