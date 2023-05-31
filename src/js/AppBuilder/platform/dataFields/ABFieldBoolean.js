import ABFieldBooleanCore from "../../core/dataFields/ABFieldBooleanCore";

export default class ABFieldBoolean extends ABFieldBooleanCore {
   constructor(values, object) {
      super(values, object);
   }

   ///
   /// Instance Methods
   ///

   isValid() {
      const validator = super.isValid();

      // validator.addError('columnName', L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name) );

      return validator;
   }

   ///
   /// Working with Actual Object Values:
   ///

   // return the grid column header definition for this instance of ABFieldBoolean
   columnHeader(options) {
      options = options || {};

      const config = super.columnHeader(options);

      config.editor = "template";
      config.css = "center";
      config.template = (row, common, value, config) => {
         // Group header
         if (row.$group) return row[this.columnName];

         // editable
         if (options.editable) {
            return (
               '<div class="ab-boolean-display">' +
               common.checkbox(row, common, value, config) +
               "</div>"
            );
         }

         // readonly
         else {
            if (value)
               return "<div class='webix_icon fa fa-check-square-o'></div>";
            else return "<div class='webix_icon fa fa-square-o'></div>";
         }
      };

      return config;
   }

   /*
    * @funciton formComponent
    * returns a drag and droppable component that is used on the UI
    * interface builder to place form components related to this ABField.
    *
    * an ABField defines which form component is used to edit it's contents.
    * However, what is returned here, needs to be able to create an instance of
    * the component that will be stored with the ABViewForm.
    */
   formComponent() {
      return super.formComponent("checkbox");
   }

   detailComponent() {
      const detailComponentSetting = super.detailComponent();

      detailComponentSetting.common = () => {
         return {
            key: "detailcheckbox",
         };
      };

      return detailComponentSetting;
   }
}
