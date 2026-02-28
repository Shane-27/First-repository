/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

define(['N/search', 'N/record', 'N/runtime', './wms_utility', './big', 'N/query'],

    function (search, record, runtime, utility, Big, query) {

        function onRequest(context) {

            var invtransferObj = {
                department: {
                    label: "Warehouse"
                },
                customer: "Wilcon Depot Inc",
                preparedBy: "Glaiza Baje",
                invTranID: "INT-10059322631197657438699427053359549821942",
                deliveryDate: "8/20/2024",
                itemType: "inventoryitem",
                whLocation: "670",
                towhLocation: "662",
                itemId: "441148",
                quantity: "",
                data: [
                    {
                        item_id: "348471",
                        lotBinArr: {
                            lotBinArray: [
                                {
                                    serialLot: "",
                                    serialLotInternalId: null,
                                    fromBinInternalId: "1876",
                                    fromBins: "Rack G-B1-L1-P2",
                                    fromBinName: "B01366",
                                    toBinInternalId: "1423",
                                    toBins: "PRODUCTION WIP",
                                    toBinName: "B00189",
                                    quantity: 1,
                                    index: 0
                                }
                            ]
                        },
                        itemType: "inventoryitem"
                    }
                ],
                fromBinId: "91",
                stockConversionRate: 1,
                opentaskQty: 2
            };

            var result = inventoryInvTransfer(invtransferObj);

            // var item_description = '';

            // var itemSearchObj = search.create({
            //     type: "item",
            //     filters:
            //         [
            //             ["internalid", "anyof", "462701"]
            //         ],
            //     columns:
            //         [
            //             search.createColumn({ name: "itemid", label: "Name" })
            //         ]
            // });

            // itemSearchObj.run().each(function (result) {
            //     item_description = result.getValue('itemid');
            //     return true;
            // });

            // log.debug('item_description', item_description);

            // var mySearch = search.load({
            //     id: 'customsearch4349',
            // });

            // var pagedData = mySearch.runPaged({
            //     pageSize: 1000,
            // });

            // var results = [];

            // var itemCount_search = search.create({
            //     type: "customrecord_sc_item_count",
            //     filters: [], //  ["custrecord_sc_item", "anyof", "335377"]
            //     columns:
            //         [
            //             search.createColumn({ name: "name", label: "ID" }),
            //             search.createColumn({ name: "custrecord_sc_item", label: "Item" }),
            //             search.createColumn({ name: "custrecord_sc_location", label: "Location" }),
            //             search.createColumn({ name: "custrecord_sc_bin", label: "Bin" }),
            //             search.createColumn({ name: "custrecord_sc_status", label: "Status" }),
            //             search.createColumn({ name: "custrecord_sc_translated_system_remarks", label: "System Remarks" }),
            //             search.createColumn({ name: "custrecord_sc_system_remarks", label: "Hidden System Remarks" }),
            //             search.createColumn({ name: "created", label: "Date Created" }),
            //             search.createColumn({
            //                 name: "custrecord_lot_or_serial_number",
            //                 join: "CUSTRECORD_SC_ITEM_COUNT_SUBLIST_LINK",
            //                 label: "Lot/Serial Number"
            //             })
            //         ]
            // });

            // pagedData.pageRanges.forEach(function (pageRange) {

            //     var page = pagedData.fetch({ index: pageRange.index });

            //     page.data.forEach(function (result) {

            //         var filters = itemCount_search.filters;

            //         filters.push(search.createFilter({
            //             name: 'custrecord_sc_item',
            //             operator: search.Operator.ANYOF,
            //             values: result.id,
            //         }));

            //         itemCount_search.filters = filters;

            //         itemCount_search.run().each(function (ic_result) {
            //             log.debug('ic_result', ic_result);
            //             return true;
            //         });

            //     });

            // });
        }

        function inventoryInvTransfer(invtransferObj) {
            log.debug({ title: 'invtransferObj', details: invtransferObj });
            var itemType = invtransferObj.itemType;
            var whLocation = invtransferObj.whLocation;
            var towhLocation = invtransferObj.towhLocation;
            var itemId = invtransferObj.itemId;
            var quantity = invtransferObj.quantity;
            var fromBinId = invtransferObj.fromBinId;
            var toBinId = invtransferObj.toBinId;
            var batchno = invtransferObj.batchno;
            var actualBeginTime = invtransferObj.actualBeginTime;
            var units = invtransferObj.units;
            var stockConversionRate = invtransferObj.stockConversionRate;
            var opentaskQty = invtransferObj.opentaskQty;
            var inventoryStatusFeature = utility.isInvStatusFeatureEnabled();
            log.debug('inventoryStatusFeature', inventoryStatusFeature);
            var isTallyScanRequired = invtransferObj.isTallyScanRequired;
            var tallyQtyArr = invtransferObj.tallyQtyArr;
            var lotArray = invtransferObj.lotArray;
            var department = invtransferObj.department.label.toLowerCase();
            var date = invtransferObj.deliveryDate;
            var customer = invtransferObj.customer.toLowerCase();
            var employee = invtransferObj.preparedBy.toLowerCase().split(" ").join("");
            var invTranID = invtransferObj.invTranID;
            var data = invtransferObj.data;
            log.debug('data', data);

            var invTransfer = record.create({
                type: record.Type.INVENTORY_TRANSFER,
                isDynamic: true
            });

            invTransfer.setValue({
                fieldId: 'customform',
                value: '707',
            });

            if (stockConversionRate == null || stockConversionRate == '' || stockConversionRate == undefined)
                stockConversionRate = 1;

            var vSubsidiaryVal = utility.getSubsidiaryforLocation(whLocation);
            log.debug('vSubsidiaryVal', vSubsidiaryVal);
            if (vSubsidiaryVal != null && vSubsidiaryVal != '') {
                invTransfer.setValue({
                    fieldId: 'subsidiary',
                    value: vSubsidiaryVal
                });
            }

            log.debug('whLocation', whLocation);
            invTransfer.setValue({
                fieldId: 'location',
                value: whLocation
            });

            log.debug('towhLocation', towhLocation);
            invTransfer.setValue({
                fieldId: 'transferlocation',
                value: towhLocation
            });
            // var currDate = utility.DateStamp();
            // var parsedCurrentDate = format.parse({
            // 	value: currDate,
            // 	type: format.Type.DATE
            // });
            log.debug('date', date);
            invTransfer.setValue({
                fieldId: 'trandate',
                value: new Date(Date.parse(date)),
            });

            invTransfer.setValue({
                fieldId: 'tranid',
                value: invTranID
            });

            var queryResult = query.runSuiteQL({
                query: "SELECT (select id from department where lower(name) LIKE '" + department + "'), (select id from customer where lower(companyname) like '" + customer + "'), (select id from employee where lower(concat(concat(firstname, middlename), lastname)) like '" + employee + "')",
            });

            log.debug('Employee', employee);
            log.debug('Query Result', queryResult.results[0].values);

            var departmentId = queryResult.results[0].values[0];

            var customerId = queryResult.results[0].values[1];

            var employeeId = queryResult.results[0].values[2];

            // log.debug('invtransferObj.deliveryDate', invtransferObj.deliveryDate);

            // var deliveryDate = new Date(Date.parse(invtransferObj.deliveryDate));

            // log.debug('Delivery Date', deliveryDate);

            invTransfer.setValue({
                fieldId: 'department',
                value: departmentId,
            });

            invTransfer.setValue({
                fieldId: 'custbody41',
                value: customerId,
            });

            invTransfer.setValue({
                fieldId: 'custbody1',
                value: employeeId,
            });

            for (var i = 0; i < data.length; i++) {

                invTransfer.selectNewLine({
                    sublistId: 'inventory',

                });

                invTransfer.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'item',
                    value: data[i].item_id,
                });

                invTransfer.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'custcol4',
                    value: new Date(Date.parse(date))
                });

                var lotBinArray = data[i].lotBinArr['lotBinArray'];

                var total_qty = 0;

                for (var j = 0; j < lotBinArray.length; j++) {

                    total_qty += lotBinArray[j].quantity;

                }

                log.debug('total_qty', total_qty);

                invTransfer.setCurrentSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'adjustqtyby',
                    value: Number((Big(total_qty)).toFixed(8)),
                });

                // for (var j = 0; j < lotBinArray.length; j++) {

                // log.debug('lotBinArray data', lotBinArray[j]);

                // invTransfer.setCurrentSublistValue({
                // 	sublistId: 'inventory',
                // 	fieldId: 'custcol_pruduction_plan_date',
                // 	value: deliveryDate
                // });
                if (data[i].itemType == "inventoryitem" || data[i].itemType == "assemblyitem") {
                    log.debug('flag util', '1'); // Hit
                    //getting use bins for item
                    var columnArray = [];
                    columnArray.push('usebins');
                    var itemUseBins = true;
                    if (utility.isValueValid(data[i].item_id)) {
                        log.debug('flag util', '2'); // Hit
                        var itemUseBinRes = utility.getItemFieldsByLookup(data[i].item_id, columnArray);
                        if (utility.isValueValid(itemUseBinRes)) {
                            log.debug('flag util', '3'); // Hit
                            itemUseBins = itemUseBinRes.usebins;
                        }
                    }

                    for (var j = 0; j < lotBinArray.length; j++) {

                        if (utility.isValueValid(lotBinArray[j].fromBinInternalId) || (utility.isValueValid(lotBinArray[j].toBinInternalId) && utility.isValueValid(itemUseBins) && itemUseBins == true) || inventoryStatusFeature) {
                            log.debug('flag util', '4'); // Hit
                            var compSubRecord = invTransfer.getCurrentSublistSubrecord({
                                sublistId: 'inventory',
                                fieldId: 'inventorydetail'
                            });
                            // var complinelength = compSubRecord.getLineCount({ sublistId: 'inventoryassignment' });
                            // if (complinelength > 0 && (itemType == "inventoryitem" || itemType == "assemblyitem")) {
                            // 	log.debug('flag util', '5');
                            // 	for (var invtassignmentLine = 0; invtassignmentLine < complinelength; invtassignmentLine++) {
                            // 		compSubRecord.removeLine({
                            // 			sublistId: 'inventoryassignment',
                            // 			line: invtassignmentLine
                            // 		});
                            // 	}
                            // 	complinelength = 0;
                            // }


                            if ((isTallyScanRequired == true) && (inventoryStatusFeature == true)) {
                                log.debug('flag util', '6');
                                for (var statusvalue = 0; statusvalue < statusArray.length; statusvalue++) {
                                    compSubRecord.selectNewLine({
                                        sublistId: 'inventoryassignment'
                                    });

                                    if (tallyQtyArr[statusvalue] == null || tallyQtyArr[statusvalue] == '' || tallyQtyArr[statusvalue] == undefined) {
                                        log.debug('flag util', '7');
                                        tallyQtyArr[statusvalue] = 0;
                                    }

                                    compSubRecord.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'quantity',
                                        value: Number(Big(tallyQtyArr[statusvalue]).div(stockConversionRate))
                                    });
                                    if (utility.isValueValid(lotBinArray[j].fromBinInternalId)) {
                                        log.debug('flag util', '8');
                                        compSubRecord.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'binnumber',
                                            value: lotBinArray[j].fromBinInternalId,
                                        });
                                    }
                                    if (utility.isValueValid(lotBinArray[j].toBinInternalId)) {
                                        log.debug('flag util', '10');
                                        compSubRecord.setCurrentSublistValue({
                                            sublistId: 'inventoryassignment',
                                            fieldId: 'tobinnumber',
                                            value: lotBinArray[j].toBinInternalId,
                                        });
                                    }
                                    compSubRecord.commitLine({ sublistId: 'inventoryassignment' });
                                }
                            }
                            else {

                                log.debug('flag util', '11'); // Hit
                                compSubRecord.selectNewLine({
                                    sublistId: 'inventoryassignment'
                                });


                                compSubRecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity',
                                    value: lotBinArray[j].quantity,
                                });

                                var qty = compSubRecord.getCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity',
                                });

                                log.debug('on getcursubval qty', qty);

                                if (utility.isValueValid(lotBinArray[j].fromBinInternalId)) {
                                    log.debug('flag util', '12'); // Hit
                                    compSubRecord.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'binnumber',
                                        value: lotBinArray[j].fromBinInternalId
                                    });
                                }

                                if (utility.isValueValid(lotBinArray[j].toBinInternalId)) {
                                    log.debug('flag util', '13'); // Hit
                                    compSubRecord.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'tobinnumber',
                                        value: lotBinArray[j].toBinInternalId
                                    });
                                }

                                compSubRecord.commitLine({ sublistId: 'inventoryassignment' });
                            }

                        }
                    }

                }
                else if (data[i].itemType == "lotnumberedinventoryitem" || data[i].itemType == "lotnumberedassemblyitem") {
                    log.debug('flag util', '14');

                    for (var j = 0; j < lotBinArray.length; j++) {

                        if (isTallyScanRequired == true) {
                            log.debug('flag util', '15');
                            var compSubRecord = invTransfer.getCurrentSublistSubrecord({
                                sublistId: 'inventory',
                                fieldId: 'inventorydetail'
                            });

                            // for (var lotvalue = 0; lotvalue < lotArray.length; lotvalue++) {

                            // 	if (tallyQtyArr[lotvalue] == null || tallyQtyArr[lotvalue] == '' || tallyQtyArr[lotvalue] == undefined) {
                            // 		log.debug('flag util', '16');
                            // 		tallyQtyArr[lotvalue] = 0;
                            // 	}


                            // 	tallyQtyArr[lotvalue] = Number(Big(tallyQtyArr[lotvalue]).div(stockConversionRate));

                            compSubRecord.selectNewLine({
                                sublistId: 'inventoryassignment'
                            });

                            compSubRecord.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'quantity',
                                value: lotBinArray[j].quantity,
                            });
                            compSubRecord.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'receiptinventorynumber',
                                value: lotBinArray[j].serialLotInternalId,
                            });
                            compSubRecord.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'binnumber',
                                value: lotBinArray[j].fromBinInternalId
                            });
                            compSubRecord.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'tobinnumber',
                                value: lotBinArray[j].toBinInternalId
                            });

                            compSubRecord.commitLine({ sublistId: 'inventoryassignment' });

                            // }
                        }
                        else {
                            log.debug('flag util', '17'); // Hit
                            var compSubRecord = invTransfer.getCurrentSublistSubrecord({
                                sublistId: 'inventory',
                                fieldId: 'inventorydetail'
                            });
                            compSubRecord.selectNewLine({
                                sublistId: 'inventoryassignment'
                            });
                            compSubRecord.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'quantity',
                                value: lotBinArray[j].quantity,
                            });
                            compSubRecord.setCurrentSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'receiptinventorynumber',
                                value: lotBinArray[j].serialLot,
                            });
                            if (utility.isValueValid(lotBinArray[j].fromBinInternalId)) {
                                log.debug('flag util', '18'); // Hit
                                compSubRecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'binnumber',
                                    value: lotBinArray[j].fromBinInternalId,
                                });
                            }
                            if (utility.isValueValid(lotBinArray[j].toBinInternalId)) {
                                log.debug('flag util', '19');
                                compSubRecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'tobinnumber',
                                    value: lotBinArray[j].toBinInternalId,
                                });
                            }
                            compSubRecord.commitLine({ sublistId: 'inventoryassignment' });
                        }


                    }
                }
                else {
                    log.debug('flag util', '20');
                    var filterssertemp = [];
                    filterssertemp.push(search.createFilter({ name: 'custrecord_wmsse_ser_tasktype', operator: search.Operator.ANYOF, values: 9 }));
                    if (utility.isValueValid(lotBinArray[j].fromBinInternalId)) {
                        log.debug('flag util', '21');
                        filterssertemp.push(search.createFilter({ name: 'custrecord_wmsse_ser_bin', operator: search.Operator.ANYOF, values: lotBinArray[j].fromBinInternalId }));
                    }
                    filterssertemp.push(search.createFilter({ name: 'custrecord_wmsse_ser_item', operator: search.Operator.ANYOF, values: data[i].item_id }));
                    var columns = [];
                    columns.push(search.createColumn('custrecord_wmsse_ser_no'));
                    columns.push(search.createColumn('name'));
                    var SrchRecordTmpSeriaObj = search.create({ type: 'customrecord_wmsse_serialentry', filters: filterssertemp, columns: columns });
                    var SrchRecordTmpSerial1 = utility.getSearchResultInJSON(SrchRecordTmpSeriaObj);
                    log.debug({ title: 'SrchRecordTmpSerial1', details: SrchRecordTmpSerial1 });
                    if (SrchRecordTmpSerial1 != null && SrchRecordTmpSerial1 != '') {
                        log.debug('flag util', '22');
                        var compSubRecord = invTransfer.getCurrentSublistSubrecord({
                            sublistId: 'inventory',
                            fieldId: 'inventorydetail'
                        });
                        var serialMatchFound = true;
                        var serialNameDtlArr = [];
                        var serialName = "";
                        var currentUserId = runtime.getCurrentUser().id;
                        for (var n = 0; n < SrchRecordTmpSerial1.length; n++) {
                            serialName = SrchRecordTmpSerial1[n].name;
                            serialMatchFound = true;
                            if (serialName) {
                                log.debug('flag util', '23');
                                serialNameDtlArr = serialName.split("^");

                                if (serialNameDtlArr.length == 3) {
                                    log.debug('flag util', '24');
                                    if ((serialNameDtlArr[0] != "inventoryTransfer")
                                        || serialNameDtlArr[1] != currentUserId) {
                                        serialMatchFound = false;
                                    }
                                }
                            }
                            if (serialMatchFound) {
                                log.debug('flag util', '25');
                                compSubRecord.selectNewLine({
                                    sublistId: 'inventoryassignment'
                                });
                                compSubRecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'quantity',
                                    value: quantity
                                });
                                compSubRecord.setCurrentSublistValue({
                                    sublistId: 'inventoryassignment',
                                    fieldId: 'receiptinventorynumber',
                                    value: SrchRecordTmpSerial1[n].custrecord_wmsse_ser_no
                                });
                                if (utility.isValueValid(lotBinArray[j].fromBinInternalId)) {
                                    log.debug('flag util', '26');
                                    compSubRecord.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'binnumber',
                                        value: lotBinArray[j].fromBinInternalId
                                    });
                                }
                                if (utility.isValueValid(lotBinArray[j].toBinInternalId)) {
                                    log.debug('flag util', '27');
                                    compSubRecord.setCurrentSublistValue({
                                        sublistId: 'inventoryassignment',
                                        fieldId: 'tobinnumber',
                                        value: lotBinArray[j].toBinInternalId
                                    });
                                }
                                compSubRecord.commitLine({ sublistId: 'inventoryassignment' });
                            }
                        }
                        var serialName = "";
                        var serialNameDtlArr = [];
                        var serialMatchFound = true;
                        for (var j = 0; j < SrchRecordTmpSerial1.length; j++) {
                            var TempRecord = SrchRecordTmpSerial1[j];
                            serialName = TempRecord.name;
                            serialMatchFound = true;
                            if (serialName) {
                                log.debug('flag util', '28');
                                serialNameDtlArr = serialName.split("^");
                                if (serialNameDtlArr.length == 3) {
                                    log.debug('flag util', '29');
                                    if ((serialNameDtlArr[0] != "inventoryTransfer")
                                        || serialNameDtlArr[1] != currentUserId) {
                                        log.debug('flag util', '30');
                                        serialMatchFound = false;
                                    }
                                }
                            }
                            if (serialMatchFound) {
                                log.debug('flag util', '31');
                                var serialRec = record.load({
                                    type: 'customrecord_wmsse_serialentry',
                                    id: TempRecord.id
                                });
                                serialRec.setValue({ fieldId: 'id', value: TempRecord.id });
                                serialRec.setValue({ fieldId: 'name', value: TempRecord.name });
                                serialRec.setValue({
                                    fieldId: 'custrecord_wmsse_ser_note1',
                                    value: 'because of discontinue of serial number scanning we have marked this serial number as closed'
                                });
                                serialRec.save();
                            }
                            TempRecord = null;
                        }
                    }
                }

                // }

                invTransfer.commitLine({ sublistId: 'inventory' });

                log.debug('info', 'line commited!');
            }

            log.debug('flag before save', true);
            var inventoryCountId = invTransfer.save({
                ignoreMandatoryFields: true,
            });
            log.debug({ title: 'inventoryCountId', details: inventoryCountId });
            var taskType = "XFER";
            var Qty = quantity;
            if (opentaskQty != null && opentaskQty != '' && opentaskQty != 'null' && opentaskQty != 'undefined') {
                log.debug('flag util', '32'); // Hit
                Qty = opentaskQty;
            }

            for (var i = 0; i < data.length; i++) {

                var lotBinArray = data[i].lotBinArr['lotBinArray'];

                for (var j = 0; j < lotBinArray.length; j++) {

                    var opentaskObj = {};
                    var opentaskId = '';
                    var impactedRec = {};
                    opentaskObj.itemType = itemType;
                    opentaskObj.whLocation = whLocation;
                    opentaskObj.itemId = data[i].item_id;
                    opentaskObj.quantity = Qty;
                    opentaskObj.fromBinId = lotBinArray[j].fromBinInternalId;
                    opentaskObj.toBinId = lotBinArray[j].toBinInternalId;
                    opentaskObj.batchno = batchno;
                    opentaskObj.inventoryCountId = inventoryCountId;
                    opentaskObj.taskType = taskType;
                    opentaskObj.actwhLocation = '';
                    opentaskObj.soInternalId = '';
                    opentaskObj.actualBeginTime = actualBeginTime;
                    opentaskObj.units = units;
                    opentaskObj.stockConversionRate = stockConversionRate;
                    opentaskId = updateMoveOpenTaskforInventory(opentaskObj);
                    impactedRec.opentaskId = opentaskId;
                    impactedRec.inventoryCountId = inventoryCountId;
                }

            }

            return impactedRec;
        }

        return {
            onRequest: onRequest
        }
    }
);