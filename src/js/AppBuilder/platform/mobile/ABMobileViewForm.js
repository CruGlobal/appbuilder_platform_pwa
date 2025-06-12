/**
 * ABMobileViewForm
 * The view that displays a form on the screen.
 */

import ABMobileViewFormCore from "../../core/mobile/ABMobileViewFormCore.js";

export default class ABMobileViewForm extends ABMobileViewFormCore {
   // constructor(...params) {
   //    super(...params);
   // }

   async init() {
      let allInits = [];
      this.views().forEach((v) => {
         allInits.push(v.init());
      });
      await Promise.all(allInits);

      const dc = this.datacollection;
      if (dc && !this.settings.clearOnLoad) {
         let rowData = dc.getCursor() || {};
         this.views().forEach((v) => {
            v.valueLoad?.(rowData);
         });
         let id = this.idID;
         this.$form.prepend(`<input
                       id="${id}"
                       name="id"
                       readonly
                       type="hidden"
                       placeholder=""
                    />`);
         let input = this.$form.find(`#${id}`);
         input.val(rowData.id);
      } else {
         // clear the form
         this.formClear();
      }
   }

   formClear() {
      const dc = this.datacollection;
      // clear the form
      dc?.setCursor(null); // clear the DC too?
      this.views().forEach((v) => {
         v.valueClear?.();
      });
   }

   /**
    * @method destroy()
    * perform any actions to clean up during a destroy/page removal
    */
   destroy() {
      this.views().forEach((v) => {
         v.destroy();
      });
   }
   buttonsNotViews(fn = () => true) {
      return this.views((v) => v.key == "mobile-button").filter(fn);
   }
   viewsNotButtons(fn = () => true) {
      return this.views((v) => v.key != "mobile-button").filter(fn);
   }

   itemsNotButtons($h) {
      let rows = [];
      this.viewsNotButtons().forEach((v) => {
         let align = "";
         // @TODO: figure out which form items need alignment:
         // if (v.key == "mobile-textbox") {
         //    align = "align-top";
         // }
         rows.push($h`<li class="${align}" >${v.html($h)}</li>`);
      });
      return rows;
   }

   buttons($h) {
      var rows = [];
      this.buttonsNotViews().forEach((v) => {
         rows.push(v.html($h));
      });
      return rows;
   }

   formItems($h) {
      // OK, we are going to align our Form Item in a <ul> list,
      // but tack on the Buttons at the bottom:
      return $h`
         <ul>
         ${this.itemsNotButtons($h)}
         </ul>
         ${this.buttons($h)}
      `;
   }

   get idID() {
      return `id_${this.id}`;
   }

   get idForm() {
      return `Form_${this.id}`;
   }

   html($h) {
      // // return () =>
      // //    $h`<div class="${this.style} ${this.alignment}">${this.text}</div>`;

      // let dc = this.datacollection;

      // if (!dc || this.AB.$store.getters[dc.id].value.length === 0)
      //    return () => $h`
      //          ${this.listTitle($h)}
      //          <div class="list links-list list-outline list-strong list-dividers skeleton-text skeleton-effect-fade">
      //             <ul>
      //                ${[...Array(20)].map(
      //                   (/* x, i */) => $h`
      //                   <li>
      //                      <a href="#">Skeleton text will go here</a>
      //                   </li>`
      //                )}
      //             </ul>
      //          </div>

      //    `;

      // return () => $h`
      //    ${this.listTitle($h)}
      //    ${this.searchBar($h)}
      //    <div
      //       class="infinite-scroll-content"
      //       onInfinite=${() => this.loadMore()}
      //    >
      //       <div class="list links-list list-outline list-strong list-dividers">
      //          <ul>${this.listItems($h)}</ul>
      //       </div>
      //       ${this.hasMore($h)}
      //    </div>`;

      return () => $h`
         <form
            class="list list-inset list-strong-ios list-dividers-ios list-outline-ios"
            id=${this.idForm}
         >
            ${this.formItems($h)}
         </form>`;
   }

   //
   // Form Actions:
   //

   busy() {
      // this.AB.$f7.preloader.show();
      this.buttonsNotViews().forEach((b) => {
         b.busy();
      });
   }

   get $form() {
      return this.AB.$(`#${this.idForm}`);
   }

   ready() {
      // this.AB.$f7.preloader.hide();

      this.buttonsNotViews().forEach((b) => {
         b.ready();
      });
   }

   // Save
   /**
    * @method saveData
    * save data in to database
    * @param $formView - webix's form element
    *
    * @return {Promise}
    */
   async save() {
      // get ABDatacollection
      const dv = this.datacollection;
      if (dv == null) return;

      // get ABObject
      const obj = dv.datasource;
      if (obj == null) return;

      // get ABModel
      const model = dv.model;
      if (model == null) return;

      // show progress icon
      this.buttonsNotViews().forEach((b) => {
         b.busy();
      });

      // give each form item a chance to Prepare their data:
      // ex: File fields need to upload their file and get back
      // their ID

      let allUpdates = [];
      (this.viewsNotButtons() || []).forEach((v) => {
         allUpdates.push(v.valuePrepare());
      });
      await Promise.all(allUpdates);

      // get update data
      const formVals = this.getFormValues(obj, dv, dv.datacollectionLink);

      // form ready function
      const formReady = (newFormVals) => {
         // clear cursor after saving.
         if (dv) {
            if (this.settings.clearOnSave) {
               // dv.setCursor(null);  // <== happens in .formClear()
               this.formClear();
            } else {
               if (newFormVals && newFormVals.id) dv.setCursor(newFormVals.id);
            }
         }

         // show progress icon

         this.ready();

         // if there was saved data pass it up to the onSaveData callback
         if (newFormVals) this.emit("saved", newFormVals);
      };

      const formError = (err) => {
         let L = this.AB.Label();

         // mark error
         if (err) {
            if (err.invalidAttributes) {
               for (const attr in err.invalidAttributes) {
                  let invalidAttrs = err.invalidAttributes[attr];
                  if (invalidAttrs && invalidAttrs[0])
                     invalidAttrs = invalidAttrs[0];

                  this.markInvalid(attr, invalidAttrs.message);
               }
            } else if (err.sqlMessage) {
               this.AB.$f7.dialog.alert(err.sqlMessage, L("Error Received:"));
            } else {
               this.AB.$f7.dialog.alert(
                  L("System could not save your data"),
                  L("Error")
               );
               this.AB.notify.developer(err, {
                  message: "Could not save your data",
                  view: this.toObj(),
               });
            }
         }

         this.buttonsNotViews().forEach((b) => {
            b.ready();
         });

         this.ready();
      };

      // wait for our Record Rules to be ready before we continue.
      await this.recordRulesReady();

      // update value from the record rule (pre-update)
      this.doRecordRulesPre(formVals);

      // validate data
      if (!this.validateData(obj, formVals)) {
         // console.warn("Data is invalid.");
         return;
      }

      let newFormVals;
      // {obj}
      // The fully populated values returned back from service call
      // We use this in our post processing Rules

      try {
         // is this an update or create?
         if (formVals.id) {
            newFormVals = await model.update(formVals.id, formVals);
         } else {
            newFormVals = await model.create(formVals);
         }
      } catch (err) {
         formError(err.data);
         throw err;
      }

      /*
      // OLD CODE:
      try {
         await this.doRecordRules(newFormVals);
         // make sure any updates from RecordRules get passed along here.
         this.doSubmitRules(newFormVals);
         formReady(newFormVals);
         return newFormVals;
      } catch (err) {
         this.AB.notify.developer(err, {
            message: "Error processing Record Rules.",
            view: this.toObj(),
            newFormVals: newFormVals,
         });
         // Question:  how do we respond to an error?
         // ?? just keep going ??
         this.doSubmitRules(newFormVals);
         formReady(newFormVals);
         return;
      }
      */

      try {
         await this.doRecordRules(newFormVals);
      } catch (err) {
         this.AB.notify.developer(err, {
            message: "Error processing Record Rules.",
            view: this.toObj(),
            newFormVals: newFormVals,
         });
      }

      // make sure any updates from RecordRules get passed along here.
      try {
         this.doSubmitRules(newFormVals);
      } catch (errs) {
         this.AB.notify.developer(errs, {
            message: "Error processing Submit Rules.",
            view: this.toObj(),
            newFormVals: newFormVals,
         });
      }

      formReady(newFormVals);
      return newFormVals;
   }

   /**
    * @method getFormValues
    *
    * @param {webix form} formView
    * @param {ABObject} obj
    * @param {ABDatacollection} dc
    * @param {ABDatacollection} dcLink [optional]
    */
   getFormValues(obj, dc, dcLink) {
      // get the fields that are on this form
      /*     const visibleFields = ["id"]; // we always want the id so we can udpate records
      formView.getValues(function (obj) {
         visibleFields.push(obj.config.name);
      });

      // only get data passed from form
      const allVals = formView.getValues();
      const formVals = {};
      visibleFields.forEach((val) => {
         formVals[val] = allVals[val];
      });
*/
      const formVals = {};
      this.viewsNotButtons().forEach((v) => {
         v.valueGet(formVals);
      });

      let input = this.$form.find(`#${this.idID}`);
      if (input) {
         formVals.id = input.val();
      }

      // get custom values
      // this.fieldComponents(
      //    (comp) =>
      //       comp instanceof ABViewFormCustom ||
      //       comp instanceof ABViewFormConnect ||
      //       comp instanceof ABViewFormDatepicker ||
      //       comp instanceof ABViewFormSelectMultiple ||
      //       (comp instanceof ABViewFormJson && comp.settings.type == "filter")
      // ).forEach((f) => {
      //    const vComponent = this.viewComponents[f.id];
      //    if (vComponent == null) return;

      //    const field = f.field();
      //    if (field) {
      //       const getValue = vComponent.getValue ?? vComponent.logic.getValue;
      //       if (getValue)
      //          formVals[field.columnName] = getValue.call(vComponent, formVals);
      //    }
      // });

      // // remove connected fields if they were not on the form and they are present in the formVals because it is a datacollection
      // obj.connectFields().forEach((f) => {
      //    if (
      //       visibleFields.indexOf(f.columnName) == -1 &&
      //       formVals[f.columnName]
      //    ) {
      //       delete formVals[f.columnName];
      //       delete formVals[f.relationName()];
      //    }
      // });

      // clear undefined values or empty arrays
      for (const prop in formVals) {
         if (
            formVals[prop] == "" ||
            formVals[prop] == null ||
            formVals[prop].length == 0
         )
            delete formVals[prop];
      }

      // Add parent's data collection cursor when a connect field does not show
      let linkValues;

      if (dcLink) {
         linkValues = dcLink.getCursor();
      }

      if (linkValues) {
         const objectLink = dcLink.datasource;

         const connectFields = obj.connectFields();
         connectFields.forEach((f) => {
            const formFieldCom = this.viewsNotButtons(
               (fComp) => fComp?.field?.()?.id === f?.id
            );

            if (
               objectLink.id == f.settings.linkObject &&
               formFieldCom.length < 1 && // check field does not show
               formVals[f.columnName] === undefined
            ) {
               const linkColName = f.indexField
                  ? f.indexField.columnName
                  : objectLink.PK();

               formVals[f.columnName] = {};
               formVals[f.columnName][linkColName] =
                  linkValues[linkColName] ?? linkValues.id;
            }
         });
      }

      // NOTE: need to pull data of current cursor to calculate Calculate & Formula fields
      // .formVals variable does not include data that does not display in the Form widget
      const cursorFormVals = Object.assign(dc.getCursor() ?? {}, formVals);

      // Set value of calculate or formula fields to use in record rule
      obj.fields((f) => f.key == "calculate" || f.key == "formula").forEach(
         (f) => {
            if (
               formVals[f.columnName] == null ||
               formVals[f.columnName] === ""
            ) {
               let reCalculate = true;

               // WORKAROUND: If "Formula" field will have Filter conditions,
               // Then it is not able to re-calculate on client side
               // because relational data is not full data so FilterComplex will not have data to check
               if (f.key == "formula" && f.settings?.where?.rules?.length > 0) {
                  reCalculate = false;
               }

               formVals[f.columnName] = f.format(cursorFormVals, reCalculate);
            }
         }
      );

      // if (allVals.translations?.length > 0)
      //    formVals.translations = allVals.translations;

      return formVals;
   }

   /**
    * @method validateData
    *
    * @param {ABObject} object
    * @param {object} formVals
    *
    * @return {boolean} isValid
    */
   validateData(object, formVals) {
      let isValid = true;

      // validate required fields
      const requiredFields = this.viewsNotButtons(
         (fComp) =>
            fComp?.field?.().settings?.required == true ||
            fComp?.settings?.required == true
      ).map((fComp) => fComp.field());

      // validate data
      // This checks to see if the Object thinks the provided
      // data is actually valid.
      let validator = object.isValidData(formVals);
      isValid = validator.pass();

      // Now make sure the form Elements think the data is valid.
      let form = document.getElementById(this.idForm);
      if (!form.checkValidity()) {
         isValid = false;
         var list = form.querySelectorAll(":invalid");
         list[0]?.focus();
      }

      // Display required messages
      // requiredFields.forEach((f) => {
      //    if (!f) return;

      //    const fieldVal = formVals[f.columnName];
      //    if (fieldVal == "" || fieldVal == null || fieldVal.length < 1) {
      //       $formView.markInvalid(f.columnName, L("This is a required field."));
      //       isValid = false;

      //       // Fix position of invalid message
      //       const $forminput = $formView.elements[f.columnName];
      //       if ($forminput) {
      //          // Y position
      //          const height = $forminput.$height;
      //          if (height < 56) {
      //             $forminput.define("height", 60);
      //             $forminput.resize();
      //          }

      //          // X position
      //          const domInvalidMessage =
      //             $forminput.$view.getElementsByClassName(
      //                "webix_inp_bottom_label"
      //             )[0];
      //          if (!domInvalidMessage?.style["margin-left"]) {
      //             domInvalidMessage.style.marginLeft = `${
      //                this.settings.labelWidth ??
      //                ABViewFormPropertyComponentDefaults.labelWidth
      //             }px`;
      //          }
      //       }
      //    }
      // });

      // if data is invalid
      // if (!isValid) {
      //    const saveButton = $formView.queryView({
      //       view: "button",
      //       type: "form",
      //    });

      //    // error message
      //    if (validator?.errors?.length) {
      //       validator.errors.forEach((err) => {
      //          $formView.markInvalid(err.name, err.message);
      //       });

      //       saveButton?.disable();
      //    } else {
      //       saveButton?.enable();
      //    }
      // }

      return isValid;
   }
}
