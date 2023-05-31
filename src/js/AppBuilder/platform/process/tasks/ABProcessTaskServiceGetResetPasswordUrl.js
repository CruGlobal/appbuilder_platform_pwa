// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
import ABProcessTaskServiceGetResetPasswordUrlCore from "../../../core/process/tasks/ABProcessTaskServiceGetResetPasswordUrlCore.js";

export default class ABProcessTaskServiceGetResetPasswordUrl extends ABProcessTaskServiceGetResetPasswordUrlCore {
   warningsEval() {
      super.warningsEval();

      if (!this.email) {
         this.warningMessage("is missing the email address.");
      }

      const processData = (this.process.processDataFields(this) ?? [])
         .filter((item) => item.field?.key == "email")
         .map((item) => {
            return {
               id: item.key,
               value: item.label,
            };
         });

      if (processData.length == 0) {
         this.warningMessage("has no previous tasks exporting email fields.");
      }
   }
}
