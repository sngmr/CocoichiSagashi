/**
 * Shop Detail View
 */
(function() {
	/**
	 * Crate Shop Detail Window
	 */
	cc1.ui.createShopDetailWindow = function(shop) {
		// Window初期化
		var win = Ti.UI.createWindow({
			barColor: '#6D2D1C',
			backgroundColor: '#F0E0BB',
			title: shop.name,
			backButtonTitle: '戻る'
		});
		
		// Table用データ取得
		var rowDataList = getRowDataList(shop);
		
		// Table行を構築
		var rowList = [];
		for (var i = 0, len = rowDataList.length; i < len; i++) {
			// 行の高さを決める
			var rowHeight = getRowHeight(rowDataList[i]);
			
			// Table行オブジェクト
			var row = Ti.UI.createTableViewRow({
				height: rowHeight,
				layout: 'horizontal',
			});
			
			// 行タイトル
			var labelLeft = Ti.UI.createLabel({
				left: 5,
				right: 5,
				top: 10,
				bottom: 10,
				width: 70,
				height: 'auto',
				textAlign: 'right',
				color: '#95665A',
				font: {
					fontSize: 12,
				},
			});
			labelLeft.text = rowDataList[i].title;
			row.add(labelLeft);
			
			// 行内容
			var labelRight = Ti.UI.createLabel({
				left: 5,
				right: 5,
				top: 10,
				bottom: 10,
				width: 'auto',
				height: 'auto',
				color: '#6D2D1C',
				font: {
					fontSize: getRowValueFontSize(rowDataList[i]),
					fontWeight: 'bold',
				},
			});
			labelRight.text = rowDataList[i].value;
			row.add(labelRight);
			
			// 行オブジェクトの特別編集
			editRowObject(rowDataList[i], row);
			
			rowList.push(row);
		}
		
		// Table生成
		var tableView = Titanium.UI.createTableView({
			style: Titanium.UI.iPhone.TableViewStyle.GROUPED,
			backgroundColor: 'transparent',
			rowBackgroundColor: 'white',
			allowsSelection: false,
			data: rowList
		});
		win.add(tableView);
		
		// XXX Analytics
		win.addEventListener('focus', function(e) {
			Ti.App.Analytics.trackPageview('ShopDetail');
			Ti.App.Analytics.trackEvent('ShopDetail', 'Show', shop.name + '(' + shop.cocoichi_id + ')', 1);
		});
		
		return win;
	}
	
	/**
	 * Table表示用データを取得
	 */
	function getRowDataList(shop) {
		return [
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
	
	/**
	 * Table行の高さを取得
	 */
	function getRowHeight(rowData) {
		// 行の高さが日本語だとうまく計算されない場合がある。ダサいけど文字数で適当に高さを決める
		var rowHeight = 'auto';
		if (rowData.title != '取り扱い') {	// 取扱いは改行が入ってるから高さ自動調整がキレイにきまる
			var byteLength = 0;
			for (var j = 0; j < rowData.value.length; j++) {
				if (escape(rowData.value.charAt(j)).match(/^%u/)) {
					byteLength += 2;
				} else {
					byteLength++;
				}
			}
			if (byteLength > 25) {
				rowHeight = 38 + (Math.floor(byteLength / 25) * 15);	// 基本38px+1行毎に15px
			}
		}
		return rowHeight;
	};
	
	/**
	 * Table行のフォントサイズを取得
	 */
	function getRowValueFontSize(rowData) {
		var fontSize = 14;
		if (rowData.title == '取り扱い') {	// 取扱いのみ特別扱い
			fontSize = 12;
		}
		return fontSize;
	}
	
	/**
	 * Table行オブジェクトに特別編集する
	 */
	function editRowObject(rowData, row) {
		// 電話番号の場合はクリックで電話をかけれるようにする
		if (rowData.title == '電話番号') {
			row.hasDetail = true;
			row.shoptel = rowData.value;
			row.addEventListener('click', function(e1) {
				var confirmDialog = Ti.UI.createAlertDialog({
					message: e1.source.shoptel + ' へ電話を掛けますか？',
					buttonNames: ['OK', 'Cancel'],
				});
				confirmDialog.addEventListener('click', function(e2) {
					if (e2.index === 0) {
						// XXX Analytics
						Ti.App.Analytics.trackEvent('ShopDetail', 'ExecuteCall', 'Click', 1);
						
						Ti.Platform.openURL('tel:' + e1.source.shoptel);
					}
				});
				
				// XXX Analytics
				Ti.App.Analytics.trackEvent('ShopDetail', 'ConfirmCall', 'Click', 1);
				
				confirmDialog.show();
			});
		}
	}
})();
