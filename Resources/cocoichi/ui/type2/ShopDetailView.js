/**
 * Shop Detail View
 */
(function() {
	/**
	 * Crate Shop Detail Window
	 */
	cc1.ui.createShopDetailWindow = function(shop) {
		// Window
		var win = Ti.UI.createWindow({
			fullscreen: true,
			navBarHidden: true,
			modal: true
		});
		var container = Ti.UI.createScrollableView({
			top: "5%",
			width: "90%",
			height: "90%",
			layout: "vertical",
			backgroundColor: "#F0E0BB",
			// 角丸にすると落ちるCrash!!!!!。なんてこったい...BUGらしい
			// borderColor: "#F0E0BB",
			// borderWidth: "1dp",
			// borderRadius: "5dp"
		});
		// TODO Androidの店舗明細閉じるボタンが欲しい
		
		// 整形した店舗データを取得
		var rowDataList = getRowDataList(shop);
		
		// 表示
		var len;
		for (var i = 0, len = rowDataList.length; i < len; i++) {
			// Spacer＆区切り（最初の行は区切り無し）
			var spacer = Ti.UI.createView({
				height: i === 0 ? "6dp" : "10dp"
			});
			if (i > 0) {
				var hr1 = Ti.UI.createView({
					top: "4dp",
					left: "1%",
					width: "98%",
					height: "1dp",
					backgroundColor: "#95665A",
					opacity: 0.3
				});
				var hr2 = Ti.UI.createView({
					top: "5dp",
					left: "1%",
					width: "98%",
					height: "1dp",
					backgroundColor: "#95665A",
					opacity: 0.1
				});
				spacer.add(hr1);
				spacer.add(hr2);
			}
			container.add(spacer);
			
			// 項目container
			var row = Ti.UI.createView({
				layout: 'horizontal'
			});
			
			// 行タイトル
			var labelLeft = Ti.UI.createLabel({
				// top: "10dp",
				left: "2%",
				width: "20%",
				height: "auto",
				textAlign: "right",
				color: '#95665A'
			});
			labelLeft.text = rowDataList[i].title;
			row.add(labelLeft);
			
			// 行内容
			var labelRight = Ti.UI.createLabel({
				// top: "10dp",
				left: "3%",
				width: "75%",
				height: "auto",
				color: "#6D2D1C"
			});
			labelRight.text = rowDataList[i].value;
			row.add(labelRight);
			
			// 行オブジェクトの特別編集
			editRowObject(rowDataList[i], row);
			
			// コンテナへ追加
			container.add(row);
		}
		
		win.add(container);
		return win;
	}
	
	/**
	 * Table表示用データを取得
	 */
	function getRowDataList(shop) {
		return [
			{ title: '店舗名', value: shop.name },
			{ title: '営業時間', value: shop.opening_hour },
			{ title: '定休日', value: shop.closed },
			{ title: '住所', value: shop.address },
			{ title: '電話番号', value: shop.tel },
			{ title: '座席数', value: shop.number_of_chair },
			{ title: '駐車場数', value: shop.number_of_parking },
			{ title: '取り扱い', value: shop.flag_string },
			{ title: '備考', value: shop.etc }
		];
	};

	// TODO Androidで電話を掛けるとこつくる
	/**
	 * Table行オブジェクトに特別編集する
	 */
	function editRowObject(rowData, row) {
		// 電話番号の場合はクリックで電話をかけれるようにする
		// if (rowData.title == '電話番号') {
			// row.hasDetail = true;
			// row.shoptel = rowData.value;
			// row.addEventListener('click', function(e1) {
				// var confirmDialog = Ti.UI.createAlertDialog({
					// message: e1.source.shoptel + ' へ電話を掛けますか？',
					// buttonNames: ['OK', 'Cancel'],
				// });
				// confirmDialog.addEventListener('click', function(e2) {
					// if (e2.index === 0) {
						// Ti.Platform.openURL('tel:' + e1.source.shoptel);
					// }
				// });
				// confirmDialog.show();
			// });
		// }
	}
})();
