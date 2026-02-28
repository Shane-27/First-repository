/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope public
 */
define(['N/search', 'N/record', 'N/runtime', './wms_utility', './big', './wms_translator', './wms_inventory_utility_3'],
	/**
	 * @param {search} search
	 */
	function (search, record, runtime, utility, Big, translator, invtUtility) {

		/**
		 * Function to validate the entered to Bin location.
		 *
		 * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
		 * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
		 */
		function doPost(requestBody) {

			var scannedQuantity = '';
			var fromBinName = '';
			// var fromBinName1 = '';
			// var fromBinName2 = '';
			var binName = '';
			// var binName1 = '';
			// var binName2 = '';
			var preferedBinName = '';
			var blnMixItem = '';
			var blnMixLot = '';
			var itemType = '';
			var fromBinInternalId = '';
			// var fromBinInternalId1 = '';
			// var fromBinInternalId2 = '';
			var itemInternalId = '';
			var warehouseLocationId = '';
			var lotName = '';
			var actualBeginTime = '';
			var stockConversionRate = '';
			var stockUnitName = '';
			var serialString = '';
			var unitType = '';
			var putawayAll = '';
			var binValidateArray = {};
			var debugString = '';
			var processType = '';
			var lotInternalId = '';
			var lotId = '';
			var toWarehouseLocationId = '';
			var isValidBin = true;
			var requestParams = '';
			var fromBinLocationType = null;
			var impactRec = {};
			var binTransferArr = [];
			var openTaskArr = [];
			var invTransferArr = [];
			var labelRecArr = [];
			var extlabelRecArr = [];
			var fromLocUseBinsFlag = '';
			var impactedRecords = {};
			var tallyLoopObj = '';
			var uomSelectionforFirstItr = '';
			var qtyUomSelected = '';
			var tallyScanBarCodeQty = '';
			var isTallyScanRequired = '';
			var barcodeQuantity = '';
			var toBinInternalId = '';
			// var toBinInternalId1 = '';
			// var toBinInternalId2 = '';
			var toBinInternalLoctype = '';
			var department = '', customer = '', preparedBy = '';
			var deliveryDate = '';
			var invTranID = '';

			var item_id_1 = '';
			var lotBinArr = '';
			var itemType_1 = '';
			var item_id_2 = '';
			var lotBinArr_2 = '';
			var itemType_2 = '';
			var item_id_3 = '';
			var lotBinArr_3 = '';
			var item_id_4 = '';
			var lotBinArr_4 = '';
			var item_id_5 = '';
			var lotBinArr_5 = '';
			var item_id_6 = '';
			var lotBinArr_6 = '';
			var item_id_7 = '';
			var lotBinArr_7 = '';
			var item_id_8 = '';
			var lotBinArr_8 = '';
			var item_id_9 = '';
			var lotBinArr_9 = '';
			var item_id_10 = '';
			var lotBinArr_10 = '';

			var data = [];

			try {
				if (utility.isValueValid(requestBody)) {
					requestParams = requestBody.params;
					invTranID = requestParams.lotName;
					department = requestParams.department;
					customer = requestParams.customer;
					preparedBy = requestParams.preparedBy;
					deliveryDate = requestParams.deliveryDate;
					scannedQuantity = '2';
					fromBinName = 'B00007';
					binName = 'RACK K-1-1-1';
					preferedBinName = requestParams.preferedBinName;
					blnMixItem = true;
					blnMixLot = true;
					itemType = 'inventoryitem';
					fromBinInternalId = '91';
					itemInternalId = '441148';
					warehouseLocationId = requestParams.warehouseLocationId;
					lotName = requestParams.lotName;
					lotInternalId = requestParams.lotInternalId;
					lotId = requestParams.lotId;
					actualBeginTime = requestParams.actualBeginTime;
					stockConversionRate = 1;
					stockUnitName = requestParams.stockUnitName;
					unitType = requestParams.unitType;
					putawayAll = requestParams.putawayAll;
					processType = 'inventoryTransfer';
					toWarehouseLocationId = requestParams.toWarehouseLocationId;
					fromLocUseBinsFlag = requestParams.fromLocUseBinsFlag;
					serialString = requestParams["serialString[]"];
					tallyLoopObj = requestParams.tallyLoopObj;
					uomSelectionforFirstItr = '1';
					qtyUomSelected = requestParams.qtyUomSelection;
					barcodeQuantity = requestParams.barcodeQuantity;
					isTallyScanRequired = requestParams.isTallyScanRequired;
					tallyScanBarCodeQty = requestParams.tallyScanBarCodeQty;

					item_id_1 = requestParams.item_id_1;
					lotBinArr = requestParams.lotBinArr;
					itemType_1 = requestParams.itemType_1;
					item_id_2 = requestParams.item_id_2;
					lotBinArr_2 = requestParams.lotBinArr_2;
					itemType_2 = requestParams.itemType_2;
					item_id_3 = requestParams.item_id_3;
					lotBinArr_3 = requestParams.lotBinArr_3;
					item_id_4 = requestParams.item_id_4;
					lotBinArr_4 = requestParams.lotBinArr_4;
					item_id_5 = requestParams.item_id_5;
					lotBinArr_5 = requestParams.lotBinArr_5;
					item_id_6 = requestParams.item_id_6;
					lotBinArr_6 = requestParams.lotBinArr_6;
					item_id_7 = requestParams.item_id_7;
					lotBinArr_7 = requestParams.lotBinArr_7;
					item_id_8 = requestParams.item_id_8;
					lotBinArr_8 = requestParams.lotBinArr_8;
					item_id_9 = requestParams.item_id_9;
					lotBinArr_9 = requestParams.lotBinArr_9;
					item_id_10 = requestParams.item_id_10;
					lotBinArr_10 = requestParams.lotBinArr_10;

					log.debug('stockConversionRate', stockConversionRate);

					var objInvDetails = [];
					var serialarr = [];

					tallyScanBarCodeQty = utility.isValueValid(tallyScanBarCodeQty) ? tallyScanBarCodeQty : 0;
					tallyLoopObj = utility.isValueValid(tallyLoopObj) ? tallyLoopObj : {};
					if (!utility.isValueValid(stockConversionRate)) {
						log.debug('flag', '4'); // Hit - on try
						stockConversionRate = 1;
					}

					if ((objInvDetails.length == 0 && (blnMixItem == false || blnMixItem == "false")) ||
						(blnMixItem == true || blnMixItem == 'true')) {
						log.debug('flag', '59'); // Hit
						if (itemType == "serializedinventoryitem" || itemType == "serializedassemblyitem") {
							log.debug('flag', '60');
							if (typeof serialString === 'string') {
								log.debug('flag', '61');
								var serialObj = JSON.parse(serialString);
								serialarr.push(serialObj.serial_number);

							}
							else {
								log.debug('flag', '62');
								for (var serialIndex in serialString) {
									var serialObj = JSON.parse(serialString[serialIndex]);
									serialarr.push(serialObj.serial_number);
								}
							}

							if (serialarr != null && serialarr != '') {
								log.debug('flag', '63');
								for (var serialNo = 0; serialNo < serialarr.length; serialNo++) {

									var getSerialNo = serialarr[serialNo];

									var serialSearch = search.load({
										id: 'customsearch_wmsse_serialdetails_search',
									});
									var serailFilters = serialSearch.filters;

									serailFilters.push(search.createFilter({
										name: 'custrecord_wmsse_ser_no',
										operator: search.Operator.IS,
										values: getSerialNo
									}));

									serailFilters.push(search.createFilter({
										name: 'custrecord_wmsse_ser_status',
										operator: search.Operator.IS,
										values: false
									}));
									serailFilters.push(search.createFilter({
										name: 'custrecord_wmsse_ser_tasktype',
										operator: search.Operator.ANYOF,
										values: '9'
									}));
									serailFilters.push(search.createFilter({
										name: 'custrecord_wmsse_ser_bin',
										operator: search.Operator.ANYOF,
										values: toBinInternalId
									}));
									serialSearch.filters = serailFilters;
									var SrchRecordTmpSerial = utility.getSearchResultInJSON(serialSearch);
									if (SrchRecordTmpSerial.length > 0) {
										log.debug('flag', '64');
										binValidateArray.isValid = false;
										return binValidateArray;
									}
									var customrecord = record.create({
										type: 'customrecord_wmsse_serialentry'
									});
									customrecord.setValue({ fieldId: 'name', value: getSerialNo });
									customrecord.setValue({ fieldId: 'custrecord_wmsse_ser_item', value: itemInternalId });
									customrecord.setValue({ fieldId: 'custrecord_wmsse_ser_qty', value: 1 });
									customrecord.setValue({ fieldId: 'custrecord_wmsse_ser_no', value: getSerialNo });
									customrecord.setValue({ fieldId: 'custrecord_wmsse_ser_status', value: false });
									customrecord.setValue({ fieldId: 'custrecord_wmsse_ser_bin', value: toBinInternalId });
									customrecord.setValue({ fieldId: 'custrecord_wmsse_ser_tasktype', value: 9 });
									customrecord.save({
										enableSourcing: false,
										ignoreMandatoryFields: true
									});

								}
							}
						}
						//below code commented, because Scannedquantity is already converted in previous screen.
						//var binTransferQty = Number((Big(scannedQuantity).mul(stockConversionRate)).toFixed(8));
						// var binTransferQty = Number((Big(scannedQuantity)).toFixed(8));
						var tallyScanObj = {};
						if (processType == 'inventoryTransfer') {
							log.debug('flag', '65'); // Hit
							// binTransferQty = Number((Big(scannedQuantity).div(stockConversionRate)).toFixed(8));
							var openTaskQty = Number((Big(scannedQuantity).div(stockConversionRate)).toFixed(8));

							if ((utility.isValueValid(tallyLoopObj)) && (itemType != "serializedinventoryitem" && itemType != "serializedassemblyitem")) {
								log.debug('flag', '66'); // Hit
								tallyScanObj = invtUtility.buildObjectFromTallyLoopObj(isTallyScanRequired, itemType_1, tallyLoopObj, tallyScanBarCodeQty);
							}

							invTranID = get_next_id();

							log.debug('invTranID', invTranID);

							update_next_id(invTranID);

							if (item_id_1) {
								data.push({
									item_id: item_id_1,
									lotBinArr: lotBinArr,
									itemType: getItemType(item_id_1),
								});
							}

							if (item_id_2) {
								data.push({
									item_id: item_id_2,
									lotBinArr: lotBinArr_2,
									itemType: getItemType(item_id_2),
								});
							}

							if (item_id_3) {
								data.push({
									item_id: item_id_3,
									lotBinArr: lotBinArr_3,
									itemType: getItemType(item_id_3),
								});
							}

							if (item_id_4) {
								data.push({
									item_id: item_id_4,
									lotBinArr: lotBinArr_4,
									itemType: getItemType(item_id_4),
								});
							}

							if (item_id_5) {
								data.push({
									item_id: item_id_5,
									lotBinArr: lotBinArr_5,
									itemType: getItemType(item_id_5),
								});
							}

							if (item_id_6) {
								data.push({
									item_id: item_id_6,
									lotBinArr: lotBinArr_6,
									itemType: getItemType(item_id_6),
								});
							}

							if (item_id_7) {
								data.push({
									item_id: item_id_7,
									lotBinArr: lotBinArr_7,
									itemType: getItemType(item_id_7),
								});
							}

							if (item_id_8) {
								data.push({
									item_id: item_id_8,
									lotBinArr: lotBinArr_8,
									itemType: getItemType(item_id_8),
								});
							}

							if (item_id_9) {
								data.push({
									item_id: item_id_9,
									lotBinArr: lotBinArr_9,
									itemType: getItemType(item_id_9),
								});
							}

							if (item_id_10) {
								data.push({
									item_id: item_id_10,
									lotBinArr: lotBinArr_10,
									itemType: getItemType(item_id_10),
								});
							}


							impactRec = fnInvTransfer(itemType, warehouseLocationId, toWarehouseLocationId, itemInternalId, '', fromBinInternalId,
								toBinInternalId, lotName, actualBeginTime, stockUnitName, stockConversionRate, openTaskQty, tallyScanObj, department, customer, preparedBy, deliveryDate, invTranID, data);


							if (utility.isValueValid(impactRec.inventoryCountId)) {
								log.debug('flag', '67'); // Hit
								invTransferArr.push(impactRec.inventoryCountId);
							} else {
								log.debug('flag', '68');
								invTransferArr.push();
							}

							if (utility.isValueValid(impactRec.opentaskId)) {
								log.debug('flag', '69'); // Hit
								openTaskArr.push(impactRec.opentaskId);
							} else {
								log.debug('flag', '70');
								openTaskArr.push();
							}
							impactedRecords._ignoreUpdate = false;
							impactedRecords.inventorytransfer = invTransferArr;
							impactedRecords.customrecord_wmsse_trn_opentask = openTaskArr;
						}

					}

					labelRecArr.push();
					extlabelRecArr.push();
					impactedRecords.customrecord_wmsse_labelprinting = labelRecArr;
					impactedRecords.customrecord_wmsse_ext_labelprinting = extlabelRecArr;
					binValidateArray.invTranId = invTranID;
					binValidateArray.impactedRecords = impactedRecords;
					binValidateArray.isValid = true;

				}
				else {
					binValidateArray.errorMessage = translator.getTranslationString('INVENTORY_TOBINVALIDATE.INVALID_BIN');
					binValidateArray.isValid = false;
				}
			}
			catch (e) {
				binValidateArray.isValid = false;
				binValidateArray.errorMessage = e.message;
				log.error({ title: 'errorMessage', details: e.message + " Stack :" + e.stack });
				log.error({ title: 'debugString', details: debugString });
			}
			log.debug('binValidateArray', binValidateArray);
			return binValidateArray;

		}

		function fnInvTransfer(itemType, warehouseLocationId, toWarehouseLocationId, itemInternalId, binTransferQty, fromBinInternalId, toBinInternalId, lotName, actualBeginTime, stockUnitName, stockConversionRate, openTaskQty, tallyScanObj, department, customer, preparedBy, deliveryDate, invTranID, data) {
			var invtransferObj = {};
			var impactRec = {};

			invtransferObj.department = department;
			invtransferObj.customer = customer;
			invtransferObj.preparedBy = preparedBy;
			invtransferObj.invTranID = invTranID;
			invtransferObj.deliveryDate = deliveryDate.value;
			invtransferObj.itemType = itemType;
			invtransferObj.whLocation = warehouseLocationId;
			invtransferObj.towhLocation = toWarehouseLocationId;
			invtransferObj.itemId = itemInternalId;
			invtransferObj.quantity = binTransferQty;
			invtransferObj.data = data;

			if (utility.isValueValid(fromBinInternalId)) {
				log.debug('flag', '82'); // Hit
				invtransferObj.fromBinId = fromBinInternalId;
			}
			if (utility.isValueValid(toBinInternalId)) {
				log.debug('flag', '83'); // Hit
				invtransferObj.toBinId = toBinInternalId;
			}
			invtransferObj.batchno = lotName;
			invtransferObj.actualBeginTime = actualBeginTime;
			invtransferObj.units = stockUnitName;
			invtransferObj.stockConversionRate = stockConversionRate;
			invtransferObj.opentaskQty = openTaskQty;

			if (tallyScanObj.isTallyScanRequired) {
				log.debug('flag', '84');
				invtransferObj.isTallyScanRequired = tallyScanObj.isTallyScanRequired;
				invtransferObj.lotArray = tallyScanObj.lotArray;
				invtransferObj.tallyQtyArr = tallyScanObj.tallyQtyArr;
				invtransferObj.statusArray = tallyScanObj.statusArray;
				invtransferObj.quantity = tallyScanObj.tallyScanBarCodeQty;
			}

			impactRec = invtUtility.inventoryInvTransfer(invtransferObj);
			return impactRec;
		}

		function get_next_id() {

			var currentScript = runtime.getCurrentScript();

			var param_current_id = currentScript.getParameter({
				name: 'custscript_sfli_last_invtran_id',
			});

			var num = BigInt(param_current_id.split("-")[1]);

			var result = num + BigInt("1");

			return 'INT-' + result.toString();

		}

		function update_next_id(next_id) {

			var script_deployment = record.load({
				type: record.Type.SCRIPT_DEPLOYMENT,
				id: 26531,
				isDynamic: true,
			});

			script_deployment.setValue('custscript_sfli_last_invtran_id', next_id);

			script_deployment.save();

		}

		function getItemType(item_id) {

			var item_type = '';

			var itemSearchObj = search.create({
				type: "item",
				filters:
					[
						["internalid", "anyof", item_id]
					],
				columns:
					[
						search.createColumn({ name: "type", label: "Type" })
					]
			});

			itemSearchObj.run().each(function (result) {
				item_type = result.recordType;
				return true;
			});

			return item_type;

		}

		return {
			'post': doPost

		};

	}
);