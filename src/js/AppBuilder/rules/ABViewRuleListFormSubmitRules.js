/**
 * @Class ABViewRuleListFormSubmitRules
 * On the ab_platform_service platform, the ABRecordRule is just
 * a blank stub. These only operate on the WEB platform, but are
 * referenced by our FORM components.
 */
import ABViewRuleList from "./ABViewRuleList";
import ABViewRule from "./ABViewRule";

import RoleConfirmMessage from "./ruleActions/ABViewRuleActionFormSubmitRuleConfirmMessage";
import RuleExistPage from "./ruleActions/ABViewRuleActionFormSubmitRuleExistPage";
import RuleParentPage from "./ruleActions/ABViewRuleActionFormSubmitRuleParentPage";
import RuleClosePopup from "./ruleActions/ABViewRuleActionFormSubmitRuleClosePopup";
import RuleWebsite from "./ruleActions/ABViewRuleActionFormSubmitRuleWebsite";
import RuleEmail from "./ruleActions/ABViewRuleActionFormSubmitRuleEmail";

export default class ABViewRuleListFormSubmitRules extends ABViewRuleList {
   constructor() {
      var settings = {
         labels: {
            header: "ab.component.form.submitRule",
            headerDefault: "Submit Rules",
         },
      };
      super(settings);
   }

   // must return the actual Rule object.
   getRule() {
      var listActions = [
         new RoleConfirmMessage(
            this.App,
            `${this.idBase}_ruleActionConfirmMessage`
         ),
         new RuleExistPage(this.App, `${this.idBase}_ruleActionExistPage`),
         new RuleParentPage(this.App, `${this.idBase}_ruleActionParentPage`),
         new RuleClosePopup(this.App, `${this.idBase}_ruleActionClosePopup`),
         new RuleWebsite(this.App, `${this.idBase}_ruleActionWebsite`),
         new RuleEmail(this.App, `${this.idBase}_ruleActionEmail`),
      ];

      var Rule = new ABViewRule(listActions);
      if (this.currentObject) {
         Rule.objectLoad(this.currentObject);
      }
      Rule.formLoad(this.currentForm);
      return Rule;
   }
}
