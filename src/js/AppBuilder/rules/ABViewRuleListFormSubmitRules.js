/**
 * @Class ABViewRuleListFormSubmitRules
 * On the ab_platform_service platform, the ABRecordRule is just
 * a blank stub. These only operate on the WEB platform, but are
 * referenced by our FORM components.
 */
export default class ABViewRuleListFormSubmitRules {
   // constructor(values, application, parent, defaultValues) {
   //    super(values, application, parent, defaultValues);
   // }
   // warningsEval() {
   //    super.warningsEval();
   //    let allViews = this.views();
   //    if (allViews.length == 0) {
   //       this.warningsMessage("has no sub views");
   //    }
   //    (this.pages() || []).forEach((p) => {
   //       p.warningsEval();
   //    });
   // }
   async formLoad() {
      console.error("TODO: implement SubmitRules.formLoad()!");
   }

   async fromSettings() {
      console.error("TODO: implement SubmitRules.fromSettings()!");
   }

   async objectLoad() {
      console.error("TODO: implement SubmitRules.objectLoad()!");
   }

   async process() {
      console.error("TODO: implement SubmitRules.process()!");
   }
}
