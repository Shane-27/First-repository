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

			var data = [];

			try {
				if (utility.isValueValid(requestBody)) {
					requestParams = requestBody.params;
					invTranID = requestParams.lotName;
					department = '';
					customer = requestParams.customer;
					preparedBy = requestParams.preparedBy;
					deliveryDate = '';
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
					stockConversionRate = requestParams.stockConversionRate;
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
					// fromBinInternalId1 = requestParams.fromBinInternalId_1;
					// fromBinName1 = requestParams.fromBinName_1;
					// binName1 = requestParams.toBinName_1;
					// toBinInternalId1 = requestParams.toBinInternalId_1;
					// fromBinInternalId2 = requestParams.fromBinInternalId_2;
					// fromBinName2 = requestParams.fromBinName_2;
					// binName2 = requestParams.toBinName_2;
					// toBinInternalId2 = requestParams.toBinInternalId_2;

					// log.debug('params_', [item_id_1, item_id_2, fromBinInternalId1, fromBinName1, binName1, toBinInternalId1, fromBinInternalId2, fromBinName2, binName2, toBinInternalId2]);

					var objInvDetails = [];
					if (!utility.isValueValid(binName)) {
						log.debug('flag', '1');
						binValidateArray.errorMessage = translator.getTranslationString('BINTRANSFER_ITEMORBINVALIDATE.EMPTY_INPUT');
						binValidateArray.isValid = false;
						isValidBin = false;
					}
					else if (fromBinName == binName && processType != 'inventoryTransfer') {
						log.debug('flag', '2');
						binValidateArray.errorMessage = translator.getTranslationString('INVENTORY_TOBINVALIDATE.SAME_FROMANDTOBINS');
						binValidateArray.isValid = false;
						isValidBin = false;
					}
					else {
						log.debug('flag', '3'); // Hit
						tallyScanBarCodeQty = utility.isValueValid(tallyScanBarCodeQty) ? tallyScanBarCodeQty : 0;
						tallyLoopObj = utility.isValueValid(tallyLoopObj) ? tallyLoopObj : {};
						if (!utility.isValueValid(stockConversionRate)) {
							log.debug('flag', '4'); // Hit - on try
							stockConversionRate = 1;
						}

						if (!utility.isValueValid(binName) &&
							(utility.isValueValid(preferedBinName) &&
								(utility.isValueValid(fromBinName) && preferedBinName != fromBinName))) {
							log.debug('flag', '5');
							binName = preferedBinName;
						}
						binValidateArray.toBinName = binName;
						var binSearchResults = search.load({
							id: 'customsearch_bin_codes'
						});
						var binSearchFilters = binSearchResults.filters;

						if (utility.isValueValid(binName)) {
							log.debug('flag', '6'); // Hit
							binSearchFilters.push(search.createFilter({
								name: 'custrecord_bin_code',
								operator: search.Operator.IS,
								values: binName
							}));
						}
						binSearchFilters.push(search.createFilter({
							name: 'inactive',
							operator: search.Operator.IS,
							values: false
						}));

						if (processType == 'inventoryTransfer') {
							log.debug('flag', '7'); // Hit
							if (utility.isValueValid(toWarehouseLocationId)) {
								log.debug('flag', '8'); // Hit
								binSearchFilters.push(search.createFilter({
									name: 'location',
									operator: search.Operator.ANYOF,
									values: toWarehouseLocationId
								}));
							}

						}
						else {
							log.debug('flag', '9');
							if (utility.isValueValid(warehouseLocationId)) {
								log.debug('flag', '10');
								binSearchFilters.push(search.createFilter({
									name: 'location',
									operator: search.Operator.ANYOF,
									values: warehouseLocationId
								}));
							}
						}
						if (processType == 'BinTransfer') {
							log.debug('flag', '11');
							var stgDirection = '';
							var binLookUp = search.lookupFields({
								type: search.Type.BIN,
								id: fromBinInternalId,
								columns: ['custrecord_wmsse_bin_loc_type', 'custrecord_wmsse_bin_stg_direction']
							});
							if (utility.isValueValid(binLookUp.custrecord_wmsse_bin_loc_type)) {
								log.debug('flag', '12');
								fromBinLocationType = binLookUp.custrecord_wmsse_bin_loc_type;
							}
							if (binLookUp.custrecord_wmsse_bin_stg_direction != undefined && binLookUp.custrecord_wmsse_bin_stg_direction[0] != undefined) {
								log.debug('flag', '13');
								stgDirection = binLookUp.custrecord_wmsse_bin_stg_direction[0].text;
							}
							var stgTypeArr = [];
							var stageLocArr = [];
							var BinlocationSearch = search.create({
								type: 'customlist_wmsse_bin_loc_type',
								columns: [{
									name: 'name'
								}]
							});
							var BinlocationTypes = BinlocationSearch.run().getRange({
								start: 0,
								end: 1000
							});
							if (BinlocationTypes != null && BinlocationTypes != '' && BinlocationTypes.length > 0) {
								log.debug('flag', '14');
								stgTypeArr.push('Stage');
								if (processType == "BinTransfer" && utility.isValueValid(fromBinLocationType) && fromBinLocationType.length > 0 && fromBinLocationType[0].text == 'WIP') {
									log.debug('flag', '15');
									stgTypeArr.push('WIP');
								}
								stageLocArr = utility.getStageLocations(stgTypeArr, BinlocationTypes);
							}
							if (stageLocArr.length > 0) {
								log.debug('flag', '16');
								stageLocArr.push('@NONE@');
								binSearchFilters.push(search.createFilter({
									name: 'custrecord_wmsse_bin_loc_type',
									operator: search.Operator.ANYOF,
									values: stageLocArr
								}));
								if (stgDirection != null && stgDirection != '' && stgDirection != 'null' &&
									stgDirection != undefined && stgDirection == 'Out') {
									log.debug('flag', '17');
									binSearchFilters.push(search.createFilter({
										name: 'custrecord_wmsse_bin_stg_direction',
										operator: search.Operator.ANYOF,
										values: ['2']
									}));
								}
								else {
									log.debug('flag', '18');
									binSearchFilters.push(search.createFilter({
										name: 'custrecord_wmsse_bin_stg_direction',
										operator: search.Operator.ANYOF,
										values: ['@NONE@', '1']
									}));
								}
							}
							else {
								log.debug('flag', '19');
								binSearchFilters.push(search.createFilter({
									name: 'custrecord_wmsse_bin_loc_type',
									operator: search.Operator.ANYOF,
									values: ['@NONE@']
								}));
								binSearchFilters.push(search.createFilter({
									name: 'custrecord_wmsse_bin_stg_direction',
									operator: search.Operator.ANYOF,
									values: ['@NONE@']
								}));
							}

						}
						else {
							log.debug('flag', '20'); // Hit
							binSearchFilters.push(search.createFilter({
								name: 'custrecord_wmsse_bin_loc_type',
								operator: search.Operator.ANYOF,
								values: ['@NONE@']
							}));
							binSearchFilters.push(search.createFilter({
								name: 'custrecord_wmsse_bin_stg_direction',
								operator: search.Operator.ANYOF,
								values: ['@NONE@']
							}));

						}
						binSearchResults.filters = binSearchFilters;
						var binSearchResultsvalues = binSearchResults.run().getRange({
							start: 0,
							end: 1000
						});
						if (utility.isValueValid(binSearchResultsvalues)) {
							log.debug('flag', '21'); // Hit
							toBinInternalId = binSearchResultsvalues[0].id;
							toBinInternalLoctype = binSearchResultsvalues[0].getText('custrecord_wmsse_bin_loc_type');
						}


						if (!utility.isValueValid(toBinInternalId) || (processType == 'BinTransfer' && toBinInternalLoctype == 'Stage' && fromBinLocationType != null && fromBinLocationType.length == 0)) {
							log.debug('flag', '22');
							binValidateArray.errorMessage = translator.getTranslationString('INVENTORY_TOBINVALIDATE.INVALID_BIN');
							binValidateArray.isValid = false;
							isValidBin = false;
						}
						else {
							log.debug('flag', '23'); // Hit
							var objInvDetails = [];
							var binLocArr = [];
							if (binName != preferedBinName) {
								log.debug('flag', '24'); // Hit
								if (blnMixItem == false || blnMixItem == "false") {
									log.debug('flag', '25');
									if (processType == 'inventoryTransfer') {
										objInvDetails = utility.fnGetInventoryBins(toWarehouseLocationId, itemInternalId, toBinInternalId);
									}
									else if ((processType == 'BinTransfer' && toBinInternalLoctype != 'Stage') || processType != 'BinTransfer') {
										log.debug('flag', '26');
										objInvDetails = utility.fnGetInventoryBins(warehouseLocationId, itemInternalId, toBinInternalId);
									}

									if (objInvDetails.length > 0) {
										log.debug('flag', '27');
										binValidateArray.errorMessage = translator.getTranslationString('INVENTORY_QUANTITYVALIDATE.MIXITEMS_FALSE');
										binValidateArray.isValid = false;
										isValidBin = false;
									}
								} else {
									log.debug('flag', '28'); // Hit
									if (processType == 'inventoryTransfer') {
										log.debug('flag', '29'); // Hit
										objInvDetails = utility.getItemMixFlagDetails(toWarehouseLocationId, itemInternalId, toBinInternalId, true, null);
									}
									else if ((processType == 'BinTransfer' && toBinInternalLoctype != 'Stage') || processType != 'BinTransfer') {
										log.debug('flag', '30');
										objInvDetails = utility.getItemMixFlagDetails(warehouseLocationId, itemInternalId, toBinInternalId, true, null);
									}
									if (objInvDetails.length > 0) {
										log.debug('flag', '31');
										binValidateArray.errorMessage = translator.getTranslationString('INVENTORY_QUANTITYVALIDATE.BIN_MIXITEMS_FALSE');
										binValidateArray.isValid = false;
										isValidBin = false;
									}
								}

								if ((isValidBin != false) && ((blnMixLot == false || blnMixLot == "false")) && (itemType == "lotnumberedinventoryitem" || itemType == "lotnumberedassemblyitem")) {
									log.debug('flag', '32');

									if (processType == 'inventoryTransfer') {
										log.debug('flag', '33');
										binLocArr = utility.fnGetInventoryBinsForLot(toWarehouseLocationId, lotName, itemInternalId, toBinInternalId);
									}
									else if ((processType == 'BinTransfer' && toBinInternalLoctype != 'Stage') || processType != 'BinTransfer') {
										log.debug('flag', '34');
										binLocArr = utility.fnGetInventoryBinsForLot(warehouseLocationId, lotName, itemInternalId, toBinInternalId);
									}

									if (binLocArr.length > 0) {
										log.debug('flag', '35');
										for (var bin = 0; bin < binLocArr.length; bin++) {
											objInvDetails.push(binLocArr[bin]);
										}
									}
									if (objInvDetails.length > 0) {
										log.debug('flag', '36');
										binValidateArray.errorMessage = translator.getTranslationString('INVENTORY_QUANTITYVALIDATE.MIXLOTS_FALSE');
										binValidateArray.isValid = false;
										isValidBin = false;
									}
								}
								if (isValidBin && ((objInvDetails.length == 0 && (blnMixItem == false || blnMixItem == "false")) ||
									(blnMixItem == true || blnMixItem == 'true'))) {
									log.debug('flag', '37'); // Hit
									if (itemType == "serializedinventoryitem" || itemType == "serializedassemblyitem") {
										log.debug('flag', '38');
										binValidateArray.errorMessage = '';
										binValidateArray.isValid = true;
										binValidateArray.custparam_enterToBin = toBinInternalId;
										binValidateArray.custparam_enterQty = Number(Big(scannedQuantity) * (stockConversionRate));//convert the calculated value to Number,since when we keep this value into custparam_enterQty array invalid string is passing to next screen other than acutal value

										var serialSearch = search.load({
											id: 'customsearch_wmsse_serialdetails_search',
										});
										var serailFilters = serialSearch.filters;

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
										var serialSearchResults = utility.getSearchResultInJSON(serialSearch);

										if (serialSearchResults.length > 0) {
											log.debug('flag', '39');
											for (var j in serialSearchResults) {
												var TempRecord = serialSearchResults[j];
												var serialRec = record.load({
													type: 'customrecord_wmsse_serialentry',
													id: TempRecord.id
												});
												serialRec.setValue({ fieldId: 'id', value: TempRecord.id });
												serialRec.setValue({ fieldId: 'name', value: TempRecord.name });
												serialRec.setValue({ fieldId: 'custrecord_wmsse_ser_note1', value: 'because of discontinue of serial number scanning we have marked this serial number as closed' });
												serialRec.setValue({ fieldId: 'custrecord_wmsse_ser_status', value: true });
												serialRec.save();
											}

										}
									}
								}

							}
						}
					}

					if (isValidBin) {
						log.debug('flag', '40'); // Hit
						if (putawayAll == 'putawayAll') {
							log.debug('flag', '41');
							if ((utility.isValueValid(fromBinName) || utility.isValueValid(fromLocUseBinsFlag)) && utility.isValueValid(binName) &&
								utility.isValueValid(itemType) && (utility.isValueValid(fromBinInternalId) || utility.isValueValid(fromLocUseBinsFlag)) &&
								utility.isValueValid(itemInternalId) && utility.isValueValid(warehouseLocationId)) {
								log.debug('flag', '42');
								if ((objInvDetails.length == 0 && (blnMixItem == false || blnMixItem == "false")) ||
									(blnMixItem == true || blnMixItem == 'true')) {
									log.debug('flag', '43');
									if (processType == 'inventoryTransfer') {
										log.debug('flag', '44');
										var invtransferObj = {};
										invtransferObj.itemType = itemType;
										invtransferObj.whLocation = warehouseLocationId;
										invtransferObj.towhLocation = toWarehouseLocationId;
										invtransferObj.itemId = itemInternalId;
										invtransferObj.fromBinId = fromBinInternalId;
										invtransferObj.toBinId = toBinInternalId;
										invtransferObj.actualBeginTime = actualBeginTime;
										invtransferObj.units = stockUnitName;
										invtransferObj.stockConversionRate = stockConversionRate;
										invtransferObj.fromLocUseBinsFlag = fromLocUseBinsFlag;

										impactRec = invtUtility.transferallInvTransfer(invtransferObj);

										if (utility.isValueValid(impactRec.inventoryCountId)) {
											log.debug('flag', '45');
											invTransferArr.push(impactRec.inventoryCountId);
										} else {
											log.debug('flag', '46');
											invTransferArr.push();
										}

										if (utility.isValueValid(impactRec.opentaskId)) {
											log.debug('flag', '48');
											openTaskArr.push(impactRec.opentaskId);
										} else {
											log.debug('flag', '49');
											openTaskArr.push();
										}
										impactedRecords.inventorytransfer = invTransferArr;
										impactedRecords.customrecord_wmsse_trn_opentask = openTaskArr;
									}
									else {
										log.debug('flag', '50');
										impactRec = fnPutawayallBinTransfer(itemType, warehouseLocationId, itemInternalId, fromBinInternalId, toBinInternalId, actualBeginTime, stockUnitName, stockConversionRate, lotInternalId, lotName);

										if (utility.isValueValid(impactRec.inventoryCountId)) {
											log.debug('flag', '51');
											binTransferArr.push(impactRec.inventoryCountId);
										} else {
											log.debug('flag', '52');
											binTransferArr.push();
										}

										if (utility.isValueValid(impactRec.opentaskId)) {
											log.debug('flag', '53');
											openTaskArr.push(impactRec.opentaskId);
										} else {
											log.debug('flag', '54');
											openTaskArr.push();
										}
										impactedRecords.bintransfer = binTransferArr;
										impactedRecords.customrecord_wmsse_trn_opentask = openTaskArr;
									}
								}
								else {
									log.debug('flag', '55');
									binValidateArray.errorMessage = translator.getTranslationString('INVENTORY_TOBINVALIDATE.INVALID_BIN');
									binValidateArray.isValid = false;
								}
							}
						}
						else {
							log.debug('flag', '56'); // Hit
							log.debug('test flag1', utility.isValueValid(scannedQuantity));
							log.debug('test flag2', utility.isValueValid(fromBinName));
							log.debug('test flag3', utility.isValueValid(fromLocUseBinsFlag));
							log.debug('test flag4', (utility.isValueValid(fromBinName) || utility.isValueValid(fromLocUseBinsFlag)));
							log.debug('test flag5', utility.isValueValid(binName));
							log.debug('test flag6', utility.isValueValid(itemType));
							log.debug('test flag7', utility.isValueValid(blnMixItem));
							log.debug('test flag8', utility.isValueValid(blnMixLot));
							log.debug('test flag10', utility.isValueValid(fromBinInternalId));
							log.debug('test flag11', utility.isValueValid(fromLocUseBinsFlag));
							log.debug('test flag12', (utility.isValueValid(fromBinInternalId) || utility.isValueValid(fromLocUseBinsFlag)));
							log.debug('test flag13', utility.isValueValid(itemInternalId));
							log.debug('test flag14', utility.isValueValid(warehouseLocationId));

							log.debug('scannedQuantity', scannedQuantity);
							log.debug('fromBinName', fromBinName);
							log.debug('fromBinName', fromLocUseBinsFlag);
							log.debug('fromBinName', fromLocUseBinsFlag);
							log.debug('binName', binName);
							log.debug('itemType', itemType);
							log.debug('blnMixItem', blnMixItem);
							log.debug('blnMixLot', blnMixLot);
							log.debug('fromBinInternalId', fromBinInternalId);
							log.debug('itemInternalId', itemInternalId);
							log.debug('warehouseLocationId', warehouseLocationId);

							if (utility.isValueValid(scannedQuantity) && (utility.isValueValid(binName) || utility.isValueValid(fromLocUseBinsFlag)) && utility.isValueValid(binName) && utility.isValueValid(itemType) && utility.isValueValid(blnMixItem) && utility.isValueValid(blnMixLot) && (utility.isValueValid(fromBinInternalId) || utility.isValueValid(fromLocUseBinsFlag)) && utility.isValueValid(itemInternalId) && utility.isValueValid(warehouseLocationId)) {
								log.debug('flag', '57'); // Hit
								var serialarr = [];
								if (utility.isValueValid(binName)) {
									log.debug('flag', '58'); // Hit
									var objInvDetails = [];
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
										var binTransferQty = Number((Big(scannedQuantity)).toFixed(8));
										var tallyScanObj = {};
										if (processType == 'inventoryTransfer') {
											log.debug('flag', '65'); // Hit
											binTransferQty = Number((Big(scannedQuantity).div(stockConversionRate)).toFixed(8));
											var openTaskQty = Number((Big(scannedQuantity).div(stockConversionRate)).toFixed(8));

											if ((utility.isValueValid(tallyLoopObj)) && (itemType != "serializedinventoryitem" && itemType != "serializedassemblyitem")) {
												log.debug('flag', '66'); // Hit
												tallyScanObj = invtUtility.buildObjectFromTallyLoopObj(isTallyScanRequired, itemType, tallyLoopObj, tallyScanBarCodeQty);
											}

											invTranID = get_next_id();

											update_next_id(invTranID);

											if (item_id_1) {
												data.push({
													item_id: item_id_1,
													lotBinArr: lotBinArr,
													itemType: itemType_1,
												});
											}

											if (item_id_2) {
												data.push({
													item_id: item_id_2,
													lotBinArr: lotBinArr_2,
													itemType: itemType_2,
												});
											}


											impactRec = fnInvTransfer(itemType, warehouseLocationId, toWarehouseLocationId, itemInternalId, binTransferQty, fromBinInternalId,
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
										else {
											log.debug('flag', '71');
											var openTaskQty = Number((Big(scannedQuantity).div(stockConversionRate)).toFixed(8));

											if ((isTallyScanRequired) && (itemType != "serializedinventoryitem" && itemType != "serializedassemblyitem")) {
												log.debug('flag', '72');
												tallyScanObj = invtUtility.buildObjectFromTallyLoopObj(isTallyScanRequired, itemType, tallyLoopObj, tallyScanBarCodeQty);
											}
											impactRec = fnBinTransfer(itemType, warehouseLocationId, itemInternalId, binTransferQty, fromBinInternalId, toBinInternalId, lotName, actualBeginTime, stockUnitName,
												stockConversionRate, openTaskQty, tallyScanObj, processType);

											if (utility.isValueValid(impactRec.inventoryCountId)) {
												log.debug('flag', '73');
												binTransferArr.push(impactRec.inventoryCountId);
											} else {
												log.debug('flag', '74');
												binTransferArr.push();
											}

											if (utility.isValueValid(impactRec.opentaskId)) {
												log.debug('flag', '75');
												openTaskArr.push(impactRec.opentaskId);
											} else {
												log.debug('flag', '76');
												openTaskArr.push();
											}
											impactedRecords._ignoreUpdate = false;
											impactedRecords.customrecord_wmsse_trn_opentask = openTaskArr;
											impactedRecords.bintransfer = binTransferArr;
										}

									}

								}
								else {
									log.debug('flag', '77');
									binValidateArray.errorMessage = translator.getTranslationString('INVENTORY_TOBINVALIDATE.INVALID_BIN');
									binValidateArray.isValid = false;
								}
							}
							else {
								log.debug('flag', '78');
								binValidateArray.errorMessage = translator.getTranslationString('INVENTORY_TOBINVALIDATE.INVALID_BIN');
								binValidateArray.isValid = false;
							}

						}

						labelRecArr.push();
						extlabelRecArr.push();
						impactedRecords.customrecord_wmsse_labelprinting = labelRecArr;
						impactedRecords.customrecord_wmsse_ext_labelprinting = extlabelRecArr;

						binValidateArray.impactedRecords = impactedRecords;
						binValidateArray.isValid = true;
					}
					else {
						log.debug('flag', '79');
						if (!utility.isValueValid(binValidateArray.errorMessage))
							binValidateArray.errorMessage = translator.getTranslationString('INVENTORY_TOBINVALIDATE.INVALID_BIN');
						binValidateArray.isValid = false;
					}
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

			return binValidateArray;

		}

		function fnPutawayallBinTransfer(itemType, warehouseLocationId, itemInternalId, fromBinInternalId, toBinInternalId, actualBeginTime, stockUnitName, stockConversionRate, lotInternalId, lotName) {
			var bintransferObj = {};
			var impactRec = {};

			bintransferObj.itemType = itemType;
			bintransferObj.whLocation = warehouseLocationId;
			bintransferObj.itemId = itemInternalId;
			bintransferObj.fromBinId = fromBinInternalId;
			bintransferObj.toBinId = toBinInternalId;
			bintransferObj.actualBeginTime = actualBeginTime;
			bintransferObj.units = stockUnitName;
			bintransferObj.stockConversionRate = stockConversionRate;
			if (utility.isInvStatusFeatureEnabled()) {
				log.debug('flag', '80');
				bintransferObj.batchno = lotInternalId;
			}
			else {
				log.debug('flag', '81');
				bintransferObj.batchno = lotName;
			}
			impactRec = invtUtility.putawayallBinTransfer(bintransferObj);
			return impactRec;
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

		function fnBinTransfer(itemType, warehouseLocationId, itemInternalId, binTransferQty, fromBinInternalId, toBinInternalId,
			lotName, actualBeginTime, stockUnitName, stockConversionRate, openTaskQty, tallyScanObj, processType) {
			var bintransferObj = {};
			var impactRec = {};

			bintransferObj.itemType = itemType;
			bintransferObj.whLocation = warehouseLocationId;
			bintransferObj.itemId = itemInternalId;
			bintransferObj.quantity = binTransferQty;
			bintransferObj.fromBinId = fromBinInternalId;
			bintransferObj.toBinId = toBinInternalId;
			bintransferObj.batchno = lotName;
			bintransferObj.actualBeginTime = actualBeginTime;
			bintransferObj.units = stockUnitName;
			bintransferObj.stockConversionRate = stockConversionRate;
			bintransferObj.opentaskQty = openTaskQty;
			bintransferObj.processType = processType;

			if (tallyScanObj.isTallyScanRequired) {
				log.debug('flag', '85');
				bintransferObj.isTallyScanRequired = tallyScanObj.isTallyScanRequired;
				bintransferObj.lotArray = tallyScanObj.lotArray;
				bintransferObj.tallyQtyArr = tallyScanObj.tallyQtyArr;
				bintransferObj.statusArray = tallyScanObj.statusArray;
				if (parseFloat(tallyScanObj.tallyScanBarCodeQty) > 0) {
					bintransferObj.quantity = Number(Big(tallyScanObj.tallyScanBarCodeQty).mul(stockConversionRate));
				}
			}

			impactRec = invtUtility.inventoryBinTransfer(bintransferObj);

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
				id: 25341,
				isDynamic: true,
			});

			script_deployment.setValue('custscript_sfli_last_invtran_id', next_id);

			script_deployment.save();

		}

		return {
			'post': doPost

		};

	}
);