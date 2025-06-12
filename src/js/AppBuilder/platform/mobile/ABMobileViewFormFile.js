/**
 * ABMobileViewFormFile
 * The view that displays a form textbox on the screen.
 */

import ABMobileViewFormFileCore from "../../core/mobile/ABMobileViewFormFileCore.js";

export default class ABMobileViewFormFile extends ABMobileViewFormFileCore {
   // constructor(...params) {
   //    super(...params);
   // }

   async init() {
      const _this = this;
      const $$ = this.AB.$;

      $$(`#${this.idUpload}`).on("change", async (ev) => {
         // update the name field:
         let name = ($$(`#${this.idUpload}`).val() ?? "").split("\\").pop();
         if (name != "") {
            $$(`#${this.idFileName}`).html(`<b>${name}</b>`);
         }
      });
   }

   destroy() {}

   valueLoad() {
      console.error("TODO: finish this");
   }

   // valueGet(rowData) {
   //    const myField = this.myField;
   //    if (myField) {
   //       const field = this.field();
   //       let value = myField.value;
   //       try {
   //          value = JSON.parse(value);
   //       } catch (e) {}
   //       rowData[field.columnName] = value;
   //    }
   // }

   /**
    * @method valuePrepare()
    * Prepare our value for the Form Submission.  This means we need to
    * upload the file to the Site, and then store the .uuid with this
    * field.
    * @return {Promise}
    */
   async valuePrepare() {
      let field = this.field();
      let formElement = document.getElementById(this.idForm);
      let formData = new FormData(formElement);

      // don't upload when not selected.
      let file = formData.get("file");
      if (file == undefined || file == null) return;
      if (file.name == "" && file.size == 0) return;

      try {
         let response = await this.AB.Network.post({
            url: field.urlUpload(false),
            data: formData,
         });
         this.AB.$(`#${this.idFormElement}`).val(
            JSON.stringify({
               uuid: response.uuid,
               filename: file.name,
            })
         );
      } catch (e) {
         this.AB.notify.developer(e, {
            context:
               "ABMobileViewFormFile.value(): unable to upload File to site",
         });
         // TODO: update Visible Form Element with Validation Error.
      }
   }

   inputFormElement($h) {
      let field = this.field();

      return $h`<form 
         id=${this.idForm} 
         method="POST" 
         enctype="multipart/form-data"
      >
      ${this.inputElementUpload($h)}
      </form>`;
   }

   inputElementUpload($h) {
      let field = this.field();
      // let placeholder = this.settings.placeholder ?? "";
      let $inputElement = $h`
         <input 
            id=${this.idUpload} 
            type="file"
            name="file"
            class="upload"
         />
      `;

      this.updateProperties($inputElement);

      return $inputElement;
   }

   get idForm() {
      return `Form_${this.id}`;
   }

   get idUpload() {
      return `Upload_${this.id}`;
   }

   get idFileName() {
      return `file_${this.id}`;
   }

   html($h) {
      let field = this.field();
      return $h`
         <div class="list-block inputs-list">
            <div class="item-content">
                <div class="item-media button button-raised button-fill fileUpload">
                    <span class="ico_upload"><i class="fa fa-paperclip" aria-hidden="true"></i></span>
                    ${this.inputFormElement($h)}
                </div>
                <div class="item-inner">
                  <div class="item-title floating-label">${this.label}</div>
                  <div class="item-input">
                    <input 
                       id=${this.idFormElement} 
                       name=${field.columnName} 
                       readonly 
                       type="hidden" 
                       placeholder=""
                    />
                    <div id=${this.idFileName}></div>
                  </div>
                </div>
            </div>
         </div>`;
   }
}
