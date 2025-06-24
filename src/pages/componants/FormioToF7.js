// FormioToF7.js
export class FormioToF7 {
   constructor(schema, data = {}) {
      this.schema = schema;
      this.elements = {};
      this.formEl = null;
      this.data = data;
   }

   render() {
      const components = this.schema.components || [];
      let html = `
<div class="list form-store-data" id="f7-form">
  <ul>
`;

      for (const comp of components) {
         const fieldHTML = this.renderComponent(comp);
         html += fieldHTML;
      }

      html += `
  </ul>
</div>`;

      const temp = document.createElement("div");
      temp.innerHTML = html;
      this.formEl = temp.querySelector("#f7-form");

      for (const comp of components) {
         if (!comp.key) continue;
         const el = this.formEl.querySelector(`[name="${comp.key}"]`);
         if (el) this.elements[comp.key] = el;
      }

      return this.formEl;
   }

   renderComponent(comp) {
      const label = comp.label || comp.key;
      const name = comp.key;
      const required = comp.validate?.required ? "required" : "";
      const disabled = comp.disabled ? "disabled" : "";
      const conditional = comp.conditional?.when
         ? `data-show-if="${comp.conditional.when}:${comp.conditional.eq}"`
         : "";
      const value = this.data[name] ?? "";

      switch (comp.type) {
         case "textfield":
         case "email":
         case "number":
         case "password":
            return `
<li class="item-content item-input" ${conditional}>
  <div class="item-inner">
    <div class="item-title item-label">${label}</div>
    <div class="item-input-wrap">
      <input type="${
         comp.type === "email"
            ? "email"
            : comp.type === "number"
            ? "number"
            : comp.type === "password"
            ? "password"
            : "text"
      }" name="${name}" placeholder="${label}" ${required} ${disabled} value="${value}" />
    </div>
  </div>
</li>`;

         case "textarea":
            return `
<li class="item-content item-input" ${conditional}>
  <div class="item-inner">
    <div class="item-title item-label">${label}</div>
    <div class="item-input-wrap">
      <textarea name="${name}" placeholder="${label}" ${required} ${disabled}>${value}</textarea>
    </div>
  </div>
</li>`;

         case "select":
            return `
<li class="item-content item-input" ${conditional}>
  <div class="item-inner">
    <div class="item-title item-label">${label}</div>
    <div class="item-input-wrap">
      <select name="${name}" ${required} ${disabled}>
        ${(comp.data?.values || [])
           .map(
              (v) =>
                 `<option value="${v.value}" ${
                    v.value === value ? "selected" : ""
                 }>${v.label}</option>`
           )
           .join("")}
      </select>
    </div>
  </div>
</li>`;

         case "checkbox":
            return `
<li class="item-content" ${conditional}>
  <label class="item-checkbox item-content">
    <input type="checkbox" name="${name}" ${required} ${disabled} ${
               value ? "checked" : ""
            } />
    <i class="icon icon-checkbox"></i>
    <div class="item-inner">
      <div class="item-title">${label}</div>
    </div>
  </label>
</li>`;

         case "radio":
            return `
<li class="item-content item-input" ${conditional}>
  <div class="item-inner">
    <div class="item-title item-label">${label}</div>
    <div class="item-input-wrap">
      ${(comp.values || [])
         .map(
            (v) => `
      <label class="radio">
        <input type="radio" name="${name}" value="${
               v.value
            }" ${required} ${disabled} ${v.value === value ? "checked" : ""} />
        <i class="icon-radio"></i> ${v.label}
      </label>`
         )
         .join("")}
    </div>
  </div>
</li>`;

         case "image":
            return `
<li class="item-content" ${conditional}>
  <div class="item-inner">
    <img src="${comp.image}" alt="${label}" style="max-width: 100%;" />
  </div>
</li>`;

         case "html":
            return `
<li class="item-content" ${conditional}>
  <div class="item-inner">
    ${comp.content || ""}
  </div>
</li>`;

         case "button":
            return `
<li class="item-content" ${conditional}>
  <div class="block">
    <button type="${
       comp.action || "button"
    }" class="button button-fill" ${disabled}>${label || "Submit"}</button>
  </div>
</li>`;

         default:
            return "";
      }
   }

   getFormElement() {
      return this.formEl;
   }

   getField(key) {
      return this.elements[key];
   }

   getValues() {
      const values = {};
      for (const key in this.elements) {
         const el = this.elements[key];
         if (el.type === "checkbox") {
            values[key] = el.checked;
         } else if (el.type === "radio") {
            const checked = this.formEl.querySelector(
               `[name="${key}"]:checked`
            );
            values[key] = checked ? checked.value : null;
         } else {
            values[key] = el.value;
         }
      }
      return values;
   }
}
