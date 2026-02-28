/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope Public
 */
define(['N/record', 'N/search', './wms_utility', './wms_translator', './wms_inventory_utility', './big'],

    function (record, search, utility, translator, invtUtility, Big) {

        function doPost(requestBody) {

            var binoritemArray = {};
            log.debug({ title: 'requestBody', details: requestBody });
            var requestParams = requestBody.params;

            var lotBinArr = requestParams.lotBinArr;
            var lotBinArray = '';
            var itemInternalId = requestParams.item_id;
            var wareHouseLocationId = requestParams.warehouseLocationId;
            var toWarehouseLocationId = requestParams.toWarehouseLocationId;
            var toWarehouseLocation = requestParams.toWarehouseLocation;
            var lotNumber = requestParams.lotNumber;
            var fromBin = requestParams.fromBin;
            var toBin = requestParams.toBin;
            var quantity = requestParams.quantity;
            var isUpdating = requestParams.isUpdating;
            var index = requestParams.index;

            log.debug('isUpdating', isUpdating);

            log.debug('index', index);

            if (!lotBinArr) {

                log.debug('!lotBinArr', '!lotBinArr = ' + true);

                lotBinArr = {};

            } else {

                lotBinArray = lotBinArr['lotBinArray'];

            }

            if (!lotBinArr['lotBinArray']) {

                lotBinArr['lotBinArray'] = [];

                lotBinArray = lotBinArr['lotBinArray'];

            }

            log.debug('lotBinArr', lotBinArr);

            log.debug('lotBinArray', lotBinArray);

            if (lotNumber) {

                var validateLotNumberObject = validateLotNumber(itemInternalId, lotNumber, wareHouseLocationId);

                log.debug('validateLotNumberObject', validateLotNumberObject);

                if (!validateLotNumberObject) {

                    binoritemArray.errorMessage = 'Scan or enter valid lot number';
                    binoritemArray.isValid = false;

                    return binoritemArray;

                }

            }

            var fromBinArray = validateBin(fromBin, itemInternalId, wareHouseLocationId);

            log.debug('fromBinArray length', fromBinArray.length == 0);

            var toBinArray = validateToBin(toWarehouseLocationId, toBin);

            log.debug('toBinArray length', toBinArray.length == 0);

            if (fromBinArray.length == 0 || toBinArray.length == 0) {

                binoritemArray.errorMessage = translator.getTranslationString('BINTRANSFER_ITEMORBINVALIDATE.INVALID_INPUT');
                binoritemArray.isValid = false;

            } else {

                log.debug('fromBinArray', fromBinArray);

                log.debug('toBinArray', toBinArray);

                log.debug('quantity', quantity);

                var fromBinInternalId = fromBinArray[0].getValue({
                    name: "binnumber",
                    join: "binOnHand",
                });

                var toBinInternalId = toBinArray[0].id;

                var fromBinName = getBinName(fromBinInternalId);

                var toBinName = getBinName(toBinInternalId);

                var total_qty = 0;

                for (var i = 0; i < quantity.selection.length; i++) {

                    var qty = Number((Big(quantity.selection[i].value).mul(quantity.selection[0].conversionrate)).toFixed(8));

                    qty = Number((Big(qty)).toFixed(8));

                    qty = Number((Big(qty).div(quantity.selection[0].conversionrate)).toFixed(8));

                    total_qty += qty;

                }

                if (isUpdating == 'true') {

                    lotBinArray[index] = {
                        serialLot: lotNumber,
                        serialLotInternalId: validateLotNumberObject ? validateLotNumberObject.lotNumberInternalId : null,
                        fromBinInternalId: fromBinInternalId,
                        fromBins: fromBin,
                        fromBinName: fromBinName,
                        toBinInternalId: toBinInternalId,
                        toBins: toBin,
                        toBinName: toBinName,
                        quantity: total_qty,
                        index: index,
                    };

                } else {

                    lotBinArray.push({
                        serialLot: lotNumber,
                        serialLotInternalId: validateLotNumberObject ? validateLotNumberObject.lotNumberInternalId : null,
                        fromBinInternalId: fromBinInternalId,
                        fromBins: fromBin,
                        fromBinName: fromBinName,
                        toBinInternalId: toBinInternalId,
                        toBins: toBin,
                        toBinName: toBinName,
                        quantity: total_qty,
                        index: lotBinArray.length,
                    });

                }

                binoritemArray.lotBinArr = lotBinArr;

            }

            log.debug('binoritemArray', binoritemArray);

            return binoritemArray;
        }


        function validateBin(binNumber, itemInternalId, loc_id) {

            var inventoryitemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        [["type", "anyof", "Assembly"], "OR", ["type", "anyof", "InvtPart"]],
                        "AND",
                        ["subsidiary", "anyof", "14"],
                        "AND",
                        ["binonhand.quantityonhand", "notequalto", "0"],
                        "AND",
                        ["binonhand.location", "anyof", loc_id],
                        "AND",
                        ["internalid", "anyof", itemInternalId],
                        "AND",
                        ["formulatext: {binonhand.binnumber}", "is", binNumber],
                    ],
                columns:
                    [
                        search.createColumn({ name: "itemid", label: "Item" }),
                        search.createColumn({ name: "upccode", label: "UPC Code" }),
                        search.createColumn({ name: "purchasedescription", label: "Description" }),
                        search.createColumn({
                            name: "location",
                            join: "binOnHand",
                            label: "Location"
                        }),
                        search.createColumn({
                            name: "binnumber",
                            join: "binOnHand",
                            label: "BIN"
                        }),
                        search.createColumn({
                            name: "quantityonhand",
                            join: "binOnHand",
                            label: "Qty"
                        })
                    ]
            });

            var inventoryitemSearchObj_results = inventoryitemSearchObj.run().getRange({
                start: 0,
                end: 1000
            });

            return inventoryitemSearchObj_results;

        }

        function validateToBin(loc_id, binNumber) {

            var binSearchObj = search.create({
                type: "bin",
                filters:
                    [
                        ["inactive", "is", "F"],
                        "AND",
                        ["location", "anyof", loc_id],
                        "AND",
                        ["binnumber", "startswith", binNumber]
                    ],
                columns:
                    [
                        search.createColumn({ name: "binnumber", label: "Bin Number" }),
                        search.createColumn({ name: "location", label: "Location" })
                    ]
            });

            var binSearchObj_results = binSearchObj.run().getRange({
                start: 0,
                end: 1000
            });

            return binSearchObj_results;
        }

        function getBinName(binInternalId) {

            var bin_record = record.load({
                type: record.Type.BIN,
                id: binInternalId,
                isDynamic: true,
            });

            return bin_record.getValue('custrecord_bin_code');

        }

        function validateLotNumber(itemInternalId, lotNumber, wareHouseLocationId) {

            var inventorynumberSearchObj = search.create({
                type: "inventorynumber",
                filters:
                    [
                        ["quantityonhand", "greaterthan", "0"],
                        "AND",
                        ["quantityavailable", "greaterthan", "0"],
                        "AND",
                        ["item.internalid", "anyof", itemInternalId],
                        "AND",
                        ["inventorynumber", "is", lotNumber],
                        "AND",
                        ["location", "anyof", wareHouseLocationId]
                    ],
                columns:
                    [
                        search.createColumn({ name: "inventorynumber", label: "Number" })
                    ]
            });

            var inventorynumberSearchObj_results = inventorynumberSearchObj.run().getRange({
                start: 0,
                end: 2,
            });

            return {
                lotNumberInternalId: inventorynumberSearchObj_results[0].id,
                lotNumber: inventorynumberSearchObj_results[0].getValue('inventorynumber'),
            };

        }

        return {
            'post': doPost
        };

    }
);