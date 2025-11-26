/**
 * ABMobileViewFormFile
 * The view that displays a form textbox on the screen.
 */

import ABMobileViewFormFileCore from "../../core/mobile/ABMobileViewFormFileCore.js";

export default class ABMobileViewFormFile extends ABMobileViewFormFileCore {
   // constructor(...params) {
   //    super(...params);
   // }

   // async init() {
   //    const $$ = this.AB.$;

   //    // Wait until the input exists
   //    this.AB.once("view:mounted", () => {
   //       $$(`#${this.idUpload}`).on("change", () => {
   //          let name = ($$(`#${this.idUpload}`).val() ?? "").split("\\").pop();
   //          if (name) {
   //             $$(`#${this.idFileName}`).html(`<b>${name}</b>`);
   //          }
   //       });
   //    });
   // }

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
      let $inputElement = $h`
    <input 
      id=${this.idUpload} 
      type="file"
      name="file"
      class="upload"
      style="position:absolute; left:0; top:0; width:100%; height:100%; opacity:0; cursor:pointer;"
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

      // setTimeout(() => {
      const $$ = this.AB.$;
      $$(`#${this.idUpload}`)
         .off("change")
         .on("change", (ev) => {
            let file = ev.target.files[0];
            let name = file?.name ?? "";

            // Show file name
            if (name) {
               $$(`#${this.idFileName}`).html(`<b>${name}</b>`);
            }

            // Show image preview if it's an image
            if (file && file.type.startsWith("image/")) {
               let reader = new FileReader();
               reader.onload = (e) => {
                  // Append or replace preview
                  let previewEl = $$(`#${this.idFileName} .preview`);
                  let imgTag = `<div class="preview" style="margin-top:6px;">
                  <img src="${e.target.result}" style="max-width:100%; border-radius:6px;" />
               </div>`;
                  if (previewEl.length) {
                     previewEl.replaceWith(imgTag);
                  } else {
                     $$(`#${this.idFileName}`).append(imgTag);
                  }
               };
               reader.readAsDataURL(file);
            } else {
               // Remove preview if not image
               $$(`#${this.idFileName} .preview`).remove();
            }
         });
      // });

      return $h`
      <div class="list no-hairlines-md">
         <div class="item-content">
            <div class="item-inner" style="flex-direction: column; align-items: stretch;">

               <!-- file upload -->
               <div 
                  class="button button-fill button-large" 
                  style="position: relative; overflow: hidden; width: 100%;"
               >
                  <span style="display: inline-flex; align-items: center; gap: 6px;">
                  <i class="material-icons">attach_file</i>
                  ${this.label}
                  </span>

                  <!-- form + input generate -->
                  <div style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;">
                  ${this.inputFormElement($h)}
                  </div>
               </div>

               <!-- display file name and preview -->
               <input 
                    id=${this.idFormElement} 
                    name=${field.columnName} 
                    readonly 
                    type="hidden" 
                    placeholder=""
               />
               <div 
                  id="${this.idFileName}" 
                  style="margin-top: 8px; font-size: 14px; color: var(--f7-text-color);"
               ></div>

            </div>
         </div>
      </div>`;
   }
}
