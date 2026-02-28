/**
 *    Copyright � 2024, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */

define([ 'N/runtime', 'N/currentRecord' , 'N/search','./wms_translator' ],

		function(runtime, currentRecord ,search ,translator) {
			function pageInit(scriptContext)
			{

				var record = currentRecord.get();
				var savedsearchcolumn = record.getField({
					fieldId: 'custrecord_wms_savedsearch_column'
				});
				if(savedsearchcolumn !=null && savedsearchcolumn != undefined) {
					record.setValue({
						fieldId: 'custpage_wms_savedsearchcolumn', value: savedsearchcolumn
					});
				}
				var savedsearch = record.getField({
					fieldId: 'custrecord_wms_savedsearch'
				});

				if(savedsearch != null && savedsearch != undefined) {
					disableFields(record);
				}
			}

	function fieldChanged(scriptContext)
	{
		var record = currentRecord.get();
		var name = scriptContext.fieldId;
		if(trim(name)==trim('custrecord_wms_savedsearch'))
		{
			record.setValue({fieldId: 'custpage_wms_savedsearchcolumn', value: ""});
			disableFields(record);
		}
		if(trim(name)==trim('custpage_wms_savedsearchcolumn'))
		{
			var isColumnValid = false;
			var selectedColumnLabel = record.getText({fieldId : 'custpage_wms_savedsearchcolumn'});
			var searchId = record.getValue({fieldId : 'custrecord_wms_savedsearch'});
			if(searchId != '' && searchId != null && searchId != 'null' && searchId != undefined) {
				var searchObj = search.load({id: searchId});

				var isColumnValid = checkValidCloumn(searchObj, selectedColumnLabel);

				if (isColumnValid == false && selectedColumnLabel != '' && selectedColumnLabel != null && selectedColumnLabel != undefined) {
					alert(translator.getTranslationStringForClientScript('binreplenschedule.savedsearchcolumn'));
					return false;
				} else {
					record.setValue({fieldId: 'custrecord_wms_savedsearch_column', value: selectedColumnLabel});
				}
			}

		}
		return true;

	}

	function disableFields(currentRecord)
	{
	  var savedsearchId = currentRecord.getValue({fieldId: 'custrecord_wms_savedsearch'});
	  var savedsearchName = currentRecord.getText({fieldId: 'custrecord_wms_savedsearch'});
      var disabled = false;
		if(savedsearchId != null && savedsearchId != '' && savedsearchId != undefined && savedsearchId != 'null') {
            disabled = true;
			var savedsearchcolumn = currentRecord.getField({fieldId: 'custpage_wms_savedsearchcolumn'});
			var savedsrchcolumn = currentRecord.getValue({fieldId: 'custpage_wms_savedsearchcolumn'});
			savedsearchcolumn.removeSelectOption({value: null});
			addFieldOptions(savedsearchcolumn, savedsearchName, savedsearchId,savedsrchcolumn);
		  	savedsearchcolumn.isMandatory= disabled ;
		}else{
          var savedsearchcolumn = currentRecord.getField({fieldId: 'custpage_wms_savedsearchcolumn'});
          if(savedsearchcolumn){
            currentRecord.setValue({fieldId: 'custpage_wms_savedsearchcolumn',value:''});
             savedsearchcolumn.isMandatory= false ;
          }
        }

			var itemField = currentRecord.getField({fieldId: 'custrecord_wms_bin_repln_item'});
			itemField.isDisabled = disabled;
      
            var itemClassification = currentRecord.getField({fieldId: 'custrecord_wms_bin_repln_item_class'});
			itemClassification.isDisabled = disabled;

			var itemFamily = currentRecord.getField({fieldId: 'custrecord_wms_bin_repln_item_family'});
			itemFamily.isDisabled = disabled;

			var itemGroup = currentRecord.getField({fieldId: 'custrecord_wms_bin_repln_item_group'});
			itemGroup.isDisabled = disabled;

			  if(disabled == true){
				  currentRecord.setValue({fieldId: 'custrecord_wms_bin_repln_item',value:''});
				  currentRecord.setValue({fieldId: 'custrecord_wms_bin_repln_item_group',value:''});
				  currentRecord.setValue({fieldId: 'custrecord_wms_bin_repln_item_family',value:''});
				  currentRecord.setValue({fieldId: 'custrecord_wms_bin_repln_item_class',value:''});
			  }

	}
	function addFieldOptions(savedsearchcolumn,searchName,searchId,selectedSavedsrchColumn){
		var templateSearch = search.load({id:searchId});
		var results = templateSearch.run().getRange({start: 0, end: 1});

		var columnsArray = [];
      if(results.length > 0){

        columnsArray = results[0].columns;
		if(selectedSavedsrchColumn){
			savedsearchcolumn.insertSelectOption(selectedSavedsrchColumn,selectedSavedsrchColumn);
		}
		  savedsearchcolumn.insertSelectOption('','');
		for (var j in columnsArray) {
			var columnObj = JSON.parse(JSON.stringify(columnsArray[j]));
			if(columnObj.label != selectedSavedsrchColumn) {
				savedsearchcolumn.insertSelectOption(columnObj.name, columnObj.label);
			}
		}
	  }
    }
          function onSave(){
            var record = currentRecord.get();
            var returnVar = true;
            var savedsearchId = record.getValue({fieldId: 'custrecord_wms_savedsearch'});
		   if(savedsearchId != '' && savedsearchId != null && savedsearchId != undefined && savedsearchId != 'null') {
			var savedsearchcolumn = record.getValue({fieldId: 'custpage_wms_savedsearchcolumn'});
            if(savedsearchcolumn == '' || savedsearchcolumn == null){
				alert(translator.getTranslationStringForClientScript('binreplenschedule.savedsearchcolumn'));
				returnVar = false;
              }
			else{
				var searchObj = search.load({id: savedsearchId});
				var selectedColumnLabel = record.getText({fieldId : 'custpage_wms_savedsearchcolumn'});
				var isColumnValid = checkValidCloumn(searchObj,selectedColumnLabel);

				if(isColumnValid == false && selectedColumnLabel != '' && selectedColumnLabel != null && selectedColumnLabel != undefined){
					alert(translator.getTranslationStringForClientScript('binreplenschedule.savedsearchcolumn'));
					returnVar = false;
				}
			}
            }
            return returnVar;
          }
		  function checkValidCloumn(searchObj,selectedColumnLabel){
			  var columnsArr = searchObj.columns;
			  var isColumnValid = false;
			  for(var i=0;i<columnsArr.length;i++){
				  if(selectedColumnLabel == columnsArr[i].label && ((columnsArr[i].name == 'internalid' &&
						  (columnsArr[i].join == 'item'||searchObj.searchType == 'item')) ||
					  (columnsArr[i].name == 'item'))){
					  isColumnValid = true;
				  }
			  }
			  return isColumnValid;
		  }

	return {
		pageInit:pageInit,
		fieldChanged:fieldChanged,
        saveRecord:onSave

	};

});
