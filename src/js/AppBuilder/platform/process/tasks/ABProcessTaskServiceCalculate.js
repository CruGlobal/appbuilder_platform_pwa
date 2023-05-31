import CalculateTaskCore from "../../../core/process/tasks/ABProcessTaskServiceCalculateCore.js";

export default class CalculateTask extends CalculateTaskCore {
   ////
   //// Process Instance Methods
   ////

   warningsEval() {
      super.warningsEval();

      if (!this.formulaText) {
         this.warningMessage("is missing a formula.");
      }

      if (this.formulaText) {
         const hash = {};
         (this.process.processDataFields(this) || []).forEach((item) => {
            hash[`{${item.label}}`] = item;
         });

         let exp = new RegExp(`{[^}]*}`, "g");
         let entries = this.formulaText.match(exp) || [];
         entries.forEach((entry) => {
            if (!hash[entry]) {
               this.warningMessage(
                  `could not resolve process value [${entry}]`
               );
            }
         });
      }
   }
}
