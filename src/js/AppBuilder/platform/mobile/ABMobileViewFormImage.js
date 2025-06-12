/**
 * ABMobileViewFormImage
 * The view that displays a form textbox on the screen.
 */

import ABMobileViewFormImageCore from "../../core/mobile/ABMobileViewFormImageCore.js";

export default class ABMobileViewFormImage extends ABMobileViewFormImageCore {
   // constructor(...params) {
   //    super(...params);
   // }

   async init() {}

   /**
    * @method valuePrepare()
    * Prepare our value for the Form Submission.  This means we need to
    * upload the file to the Site, and then store the .uuid with this
    * field.
    * @return {Promise}
    */
   // async valuePrepare() {
   //    let field = this.field();
   //    let formElement = document.getElementById(this.id);
   //    let formData = new FormData(formElement);

   //    try {
   //       let response = await this.AB.Network.post({
   //          url: field.urlUpload(false),
   //          data: formData,
   //       });
   //       this.AB.$(`#${this.idFileID}`).val(response.uuid);
   //    } catch (e) {
   //       this.AB.notify.developer(e, {
   //          context:
   //             "ABMobileViewFormFile.value(): unable to upload File to site",
   //       });
   //       // TODO: update Visible Form Element with Validation Error.
   //    }
   // }

   valueGet(rowData) {
      super.valueGet(rowData);

      // Images just store .uuid, so pull out the file.uuid info
      // and return that.
      const field = this.field();
      if (rowData[field.columnName]) {
         try {
            let val = JSON.parse(rowData[field.columnName]);
            val = val?.uuid ?? val;
            rowData[field.columnName] = val;
         } catch (e) {}
      }
   }

   inputElementUpload($h) {
      let $inputElement = $h`
      <input 
         id=${this.idUpload} 
         name="file"
         accept="image/*"
         type="file"
         placeholder=""
      />`;

      this.updateProperties($inputElement);

      return $inputElement;
   }
}
