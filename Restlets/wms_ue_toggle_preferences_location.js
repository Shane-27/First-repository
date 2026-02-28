/**
 *    Copyright (c) 2025, Oracle and/or its affiliates. All rights reserved.
 */

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */

/** This UE script dynamically controls the visibility and state of two custom email recipient fields,
 * custrecord_wms_location_emailsend1 and custrecord_wms_location_emailsend2, based on the
 * 'usewarehousemanagement' checkbox on a custom record.
 */

define(['N/record', 'N/ui/serverWidget', 'N/log', 'N/runtime'], function(record, serverWidget, log, runtime) {

    function beforeLoad(context) {
        if(runtime.executionContext == "USERINTERFACE" || runtime.executionContext == "userinterface"){
            if (context.type === context.UserEventType.EDIT || context.type === context.UserEventType.VIEW || context.type === context.UserEventType.CREATE)  {

                var newRecord = context.newRecord;
                var form = context.form;

                var useWarehouseManagement = newRecord.getValue({
                    fieldId: 'usewarehousemanagement'
                });

                log.debug({
                    title: 'beforeLoad - usewarehousemanagement value',
                    details: useWarehouseManagement
                });

                var primaryRecipientField = form.getField('custrecord_wms_location_emailsend1');
                var addnlRecipientField = form.getField('custrecord_wms_location_emailsend2');

                if (useWarehouseManagement) {

                    primaryRecipientField.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.NORMAL
                    });
                    addnlRecipientField.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.NORMAL
                    });
                    primaryRecipientField.isDisabled = false;
                    addnlRecipientField.isDisabled = false;

                } else {
                    primaryRecipientField.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });
                    addnlRecipientField.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });
                    primaryRecipientField.isDisabled = true;
                    addnlRecipientField.isDisabled = true;
                }
            }
        }
    }

    function beforeSubmit(context) {
        if(runtime.executionContext == "USERINTERFACE" || runtime.executionContext == "userinterface") {

            if (context.type === context.UserEventType.EDIT) {

                var newRecord = context.newRecord;

                var useWarehouseManagement = newRecord.getValue({
                    fieldId: 'usewarehousemanagement'
                });

                log.debug({
                    title: 'beforeSubmit - usewarehousemanagement value',
                    details: useWarehouseManagement
                });

                if (!useWarehouseManagement) {
                    log.debug({
                        title: 'beforeSubmit - Clearing field values',
                        details: 'usewarehousemanagement is unchecked, clearing values.'
                    });

                    newRecord.setValue({
                        fieldId: 'custrecord_wms_location_emailsend1',
                        value: ''
                    });

                    newRecord.setValue({
                        fieldId: 'custrecord_wms_location_emailsend2',
                        value: ''
                    });

                    log.debug({
                        title: 'beforeSubmit - Field values cleared',
                        details: 'The values for primaryrecipient and addnlrecipient have been cleared.'
                    });
                }

                var primaryRecipientValue = newRecord.getValue({
                    fieldId: 'custrecord_wms_location_emailsend1'
                });
                var addnlRecipientValue = newRecord.getValue({
                    fieldId: 'custrecord_wms_location_emailsend2'
                });

                log.debug({
                    title: 'beforeSubmit - Values after clearing',
                    details: 'Primary Recipient Value: ' + primaryRecipientValue + ', Additional Recipient Value: ' + addnlRecipientValue
                });
            }
        }
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
    };

});
