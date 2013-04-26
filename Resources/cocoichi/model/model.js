/**
 * Model Root
 */
(function() {
	// model用名前空間
	cc1.model = {
		db: cc1.database.db
	};
	
	/**
	 * 現在のResultSet位置に存在するデータをObjectへ移送する
	 */
	cc1.model.populate = function(rs, fieldNames) {
		var obj = {};
		for (var i = 0; i < fieldNames.length; i++) {
			obj[fieldNames[i]] = rs.fieldByName(fieldNames[i]);
		}
		return obj;
	}
})();

Ti.include(
	'Shop.js'
);
