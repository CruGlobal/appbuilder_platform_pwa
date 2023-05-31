import AccountingJEArchiveCore from "../../../core/process/tasks/ABProcessTaskServiceAccountingJEArchiveCore.js";

export default class AccountingJEArchive extends AccountingJEArchiveCore {
   ////
   //// Process Instance Methods
   ////

   propertyIDs(id) {
      return {
         name: `${id}_name`,
         processBatchValue: `${id}_processBatchValue`,
         objectBatch: `${id}_objectBatch`,
         objectBalance: `${id}_objectBalance`,
         objectJE: `${id}_objectJE`,
         objectJEArchive: `${id}_objectJEArchive`,

         fieldBatchFiscalMonth: `${id}_fieldBatchFiscalMonth`,
         fieldJeAccount: `${id}_fieldJeAccount`,
         fieldJeRC: `${id}_fieldJeRC`,
         fieldJeArchiveBalance: `${id}_fieldJeArchiveBalance`,
         fieldBrFiscalMonth: `${id}_fieldBrFiscalMonth`,
         fieldBrAccount: `${id}_fieldBrAccount`,
         fieldBrRC: `${id}_fieldBrRC`,

         fieldsMatch: `${id}_fieldsMatch`,
      };
   }

   /**
    * propertiesShow()
    * display the properties panel for this Process Element.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesShow(id) {
      let ids = this.propertyIDs(id);
      var L = this.AB.Label();

      let processValues = [{ id: 0, value: L("Select a Process Value") }];
      let processDataFields = this.process.processDataFields(this);
      (processDataFields || []).forEach((row) => {
         processValues.push({ id: row.key, value: row.label });
      });

      let objectList = this.AB.objects().map((o) => {
         return { id: o.id, value: o.label || o.name, object: o };
      });

      objectList.unshift({
         id: 0,
         value: L("Select an Object"),
      });

      let getConnectFieldOptions = (objectId) => {
         let object = this.AB.objectByID(objectId);
         if (!object) return [];

         let options = object
            .fields((f) => f.isConnection)
            .map((f) => {
               return {
                  id: f.id,
                  value: f.label,
               };
            });

         options.unshift({
            id: 0,
            value: L("Select a Field"),
         });

         return options;
      };

      let updateFields = (fieldPickers, fieldValues) => {
         fieldPickers.forEach((fp) => {
            var picker = $$(fp);
            if (picker) {
               picker.define("options", fieldValues);
               picker.refresh();
               picker.show();
            }
         });
      };

      let refreshBatchFields = (objectId) => {
         let options = getConnectFieldOptions(objectId);
         updateFields([ids.fieldBatchFiscalMonth], options);
      };

      let refreshBRFields = (objectId) => {
         let options = getConnectFieldOptions(objectId);
         updateFields(
            [ids.fieldBrAccount, ids.fieldBrFiscalMonth, ids.fieldBrRC],
            options
         );
      };

      let refreshJeFields = (objectId) => {
         let options = getConnectFieldOptions(objectId);
         updateFields([ids.fieldJeAccount, ids.fieldJeRC], options);
      };

      let refreshJeArchiveFields = (objectId) => {
         let options = getConnectFieldOptions(objectId);
         updateFields([ids.fieldJeArchiveBalance], options);
      };

      let refreshFieldsMatch = () => {
         let $fieldsMatch = $$(ids.fieldsMatch);
         if (!$fieldsMatch) return;

         // clear form
         webix.ui([], $fieldsMatch);

         let JEObj = this.AB.objectByID(this.objectJE);
         if (!JEObj) return;

         let JEArchiveObj = this.AB.objectByID(this.objectJEArchive);
         if (!JEArchiveObj) return;

         // create JE acrhive field options to the form
         JEArchiveObj.fields().forEach((f) => {
            let jeFields = [];

            if (f.isConnection) {
               jeFields = JEObj.fields((fJe) => {
                  return (
                     fJe.isConnection &&
                     fJe.settings &&
                     f.settings &&
                     fJe.settings.linkObject == f.settings.linkObject &&
                     fJe.settings.linkType == f.settings.linkType &&
                     fJe.settings.linkViaType == f.settings.linkViaType &&
                     fJe.settings.isCustomFK == f.settings.isCustomFK
                  );
               });
            } else {
               jeFields = JEObj.fields((fJe) => fJe.key == f.key);
            }

            jeFields = jeFields.map((fJe) => {
               return {
                  id: fJe.id,
                  value: fJe.label,
               };
            });

            $fieldsMatch.addView({
               view: "select",
               name: f.id,
               label: f.label,
               options: jeFields,
            });
         });

         $fieldsMatch.setValues(this.fieldsMatch || {});
      };

      let fieldBatchList = getConnectFieldOptions(this.objectBatch);
      let fieldBalanceList = getConnectFieldOptions(this.objectBalance);
      let fieldJeList = getConnectFieldOptions(this.objectJE);
      let fieldJeArchiveList = getConnectFieldOptions(this.objectJEArchive);

      let ui = {
         id: id,
         view: "form",
         elementsConfig: {
            labelWidth: 180,
         },
         elements: [
            {
               id: ids.name,
               view: "text",
               label: L("Name"),
               name: "name",
               value: this.name,
            },
            {
               id: ids.processBatchValue,
               view: "select",
               label: L("Process Batch Value"),
               value: this.processBatchValue,
               name: "processBatchValue",
               options: processValues,
            },
            {
               id: ids.objectBatch,
               view: "select",
               label: L("Batch Object"),
               value: this.objectBatch,
               name: "objectBatch",
               options: objectList,
               on: {
                  onChange: (newVal) => {
                     this.objectBatch = newVal;
                     refreshBatchFields(newVal);
                  },
               },
            },
            {
               id: ids.fieldBatchFiscalMonth,
               view: "select",
               label: L("Batch -> Fiscal Month"),
               value: this.fieldBatchFiscalMonth,
               name: "fieldBatchFiscalMonth",
               options: fieldBatchList,
            },
            {
               id: ids.objectBalance,
               view: "select",
               label: L("BR Object"),
               value: this.objectBalance,
               name: "objectBalance",
               options: objectList,
               on: {
                  onChange: (newVal) => {
                     this.objectBalance = newVal;
                     refreshBRFields(newVal);
                  },
               },
            },
            {
               id: ids.fieldBrFiscalMonth,
               view: "select",
               label: L("BR -> Fiscal Month"),
               value: this.fieldBrFiscalMonth,
               name: "fieldBrFiscalMonth",
               options: fieldBalanceList,
            },
            {
               id: ids.fieldBrAccount,
               view: "select",
               label: L("BR -> Account"),
               value: this.fieldBrAccount,
               name: "fieldBrAccount",
               options: fieldBalanceList,
            },
            {
               id: ids.fieldBrRC,
               view: "select",
               label: L("BR -> RC"),
               value: this.fieldBrRC,
               name: "fieldBrRC",
               options: fieldBalanceList,
            },
            {
               id: ids.objectJE,
               view: "select",
               label: L("JE Object"),
               value: this.objectJE,
               name: "objectJE",
               options: objectList,
               on: {
                  onChange: (newVal) => {
                     this.objectJE = newVal;
                     refreshJeFields(newVal);
                     refreshFieldsMatch();
                  },
               },
            },
            {
               id: ids.fieldJeAccount,
               view: "select",
               label: L("JE -> Account"),
               value: this.fieldJeAccount,
               name: "fieldJeAccount",
               options: fieldJeList,
            },
            {
               id: ids.fieldJeRC,
               view: "select",
               label: L("JE -> RC"),
               value: this.fieldJeRC,
               name: "fieldJeRC",
               options: fieldJeList,
            },
            {
               id: ids.objectJEArchive,
               view: "select",
               label: L("JE Archive Object"),
               value: this.objectJEArchive,
               name: "objectJEArchive",
               options: objectList,
               on: {
                  onChange: (newVal) => {
                     this.objectJEArchive = newVal;
                     refreshJeArchiveFields(newVal);
                     refreshFieldsMatch();
                  },
               },
            },
            {
               id: ids.fieldJeArchiveBalance,
               view: "select",
               label: L("JE Archive -> BR"),
               value: this.fieldJeArchiveBalance,
               name: "fieldJeArchiveBalance",
               options: fieldJeArchiveList,
            },
            {
               view: "fieldset",
               label: "Fields Matching",
               body: {
                  id: ids.fieldsMatch,
                  view: "form",
                  borderless: true,
                  elements: [],
               },
            },
         ],
      };

      webix.ui(ui, $$(id));

      $$(id).show();

      refreshFieldsMatch();
   }

   /**
    * propertiesStash()
    * pull our values from our property panel.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesStash(id) {
      let ids = this.propertyIDs(id);
      this.name = this.property(ids.name);

      // TIP: keep the .settings entries == ids[s] keys and this will
      // remain simple:
      this.defaults.settings.forEach((s) => {
         if (s === "fieldsMatch") {
            this[s] = $$(ids.fieldsMatch).getValues();
         } else {
            this[s] = this.property(ids[s]);
         }
      });
   }
}
