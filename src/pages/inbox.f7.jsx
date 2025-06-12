import { Form } from "formiojs"; // เพิ่มด้านบนสุดของไฟล์

export default (AB) => {
   const L = AB.Label();
   // let lang = AB.Account.language();
   let inboxMeta = []; // to store inboxMeta
   let inboxItems = []; // to store inbox items
   let isLoading = true; // flag to track loading state

   async function loadInbox() {
      try {
         const inboxData = await AB.Network.get({ url: "/config/inbox" });
         inboxMeta = inboxData.inboxMeta || [];
         const inbox = inboxData.inbox || [];

         inboxItems = {};

         inboxMeta.forEach((meta) => {
            inboxItems[meta.id] = {};
            meta.processes.forEach((process) => {
               // เลือกเฉพาะ items ที่ match definition = process.id
               inboxItems[meta.id][process.id] = inbox.filter(
                  (item) => item.definition === process.id
               );
            });
         });
         // this._inboxData = inboxData;
      } catch (err) {
         console.error("Failed to load inbox:", err);
         inboxMeta = [];
         inboxItems = [];
      } finally {
         isLoading = false;
         // $jsx.instance.$update();
      }
   }

   async function openFormioPopup(itemsInProcess, startIndex, $f7) {
      const popup = document.getElementById("formio-popup");
      // if (popup?.f7Popup) popup.f7Popup.open();
      $f7.popup.open(popup);

      const container = document.getElementById("formio-form-container");
      container.innerHTML = "";

      // Render Swiper HTML
      const swiperHtml = `
      <div class="swiper">
         <div class="swiper-wrapper">
            ${itemsInProcess
               .map(
                  (item, i) => `
               <div class="swiper-slide" data-index="${i}">
                  <div class="formio-slide-container" id="formio-slide-${i}">
                     ${i === startIndex ? "Loading form..." : ""}
                  </div>
               </div>
            `
               )
               .join("")}
         </div>
      </div>
   `;

      container.innerHTML = swiperHtml;

      // Initialize Swiper using F7
      const swiper = $f7.swiper.create(".swiper", {
         initialSlide: startIndex,
         on: {
            slideChange: async function () {
               const newIndex = this.activeIndex;
               const newItem = itemsInProcess[newIndex];
               const target = document.getElementById(
                  `formio-slide-${newIndex}`
               );
               if (!target || target.dataset.loaded) return;

               try {
                  target.innerHTML = "";
                  const schema = {
                     components: newItem?.ui?.components || [],
                  };
                  const form = await Form.createForm(target, schema, {
                     readOnly: false,
                  });
                  form.submission = { data: schema };
                  target.dataset.loaded = "true";
               } catch (e) {
                  target.innerHTML = `<div class="text-color-red text-align-center">Error loading form</div>`;
               }
            },
         },
      });

      // Trigger first form load
      swiper.emit("slideChange");
   }

   // Call once when component loads
   loadInbox();

   return (props, { $f7 }) => {
      // const inboxId = $f7route?.params?.id;
      // console.log("Route param ID:", inboxId);
      return () => (
         <div class="page">
            <div class="navbar">
               <div class="navbar-bg"></div>
               <div class="navbar-inner sliding">
                  <div class="left">
                     <a href="#" class="link back">
                        <i class="icon icon-back"></i>
                        <span class="if-not-md">{L("Back")}</span>
                     </a>
                  </div>
                  <div class="title">{L("Inbox")}</div>
               </div>
            </div>
            <div class="page-content">
               {isLoading ? (
                  <div class="block text-align-center">
                     <p>Loading inbox...</p>
                  </div>
               ) : inboxMeta.length > 0 ? (
                  <div class="list list-strong accordion-list">
                     <ul>
                        {inboxMeta.map((meta) => (
                           <li
                              class="accordion-item accordion-item-opened"
                              key={meta.id}
                           >
                              <a class="item-link item-content">
                                 <div class="item-inner">
                                    <div class="item-title">
                                       {meta.translations.find(
                                          (t) => t.language_code === "en"
                                       )?.label || meta.label}
                                    </div>
                                 </div>
                              </a>
                              <div class="accordion-item-content">
                                 <div class="block">
                                    {meta.processes.map((process) => (
                                       <div key={process.id}>
                                          <h3>
                                             {process.translations.find(
                                                (t) => t.language_code === "en"
                                             )?.label || process.label}
                                          </h3>
                                          <div class="list">
                                             <ul>
                                                {(() => {
                                                   const itemsInProcess =
                                                      inboxItems[meta.id]?.[
                                                         process.id
                                                      ] || [];
                                                   const badgeCount =
                                                      itemsInProcess.length;

                                                   if (badgeCount === 0)
                                                      return null;

                                                   const ItemName =
                                                      itemsInProcess[0].name;

                                                   return (
                                                      <li key={process.id}>
                                                         <a
                                                            class="item-link"
                                                            href="#"
                                                            onClick={() =>
                                                               openFormioPopup(
                                                                  itemsInProcess,
                                                                  0,
                                                                  $f7
                                                               )
                                                            }
                                                         >
                                                            <div class="item-content">
                                                               <div class="item-inner">
                                                                  <div class="item-title">
                                                                     {ItemName}
                                                                  </div>
                                                                  <div class="item-after">
                                                                     <span class="badge color-red">
                                                                        {
                                                                           badgeCount
                                                                        }
                                                                     </span>
                                                                  </div>
                                                               </div>
                                                            </div>
                                                         </a>
                                                      </li>
                                                   );
                                                })()}
                                             </ul>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </li>
                        ))}
                     </ul>
                  </div>
               ) : (
                  <div class="block text-align-center">
                     <p>No inbox available.</p>
                  </div>
               )}
            </div>
            <f7-popup id="formio-popup" tablet-fullscreen>
               <f7-page>
                  <f7-navbar title="Inbox item">
                     <f7-nav-right>
                        <f7-link popup-close>Close</f7-link>
                     </f7-nav-right>
                  </f7-navbar>
                  <f7-page-content>
                     <div
                        id="formio-form-container"
                        style="padding: 10px;"
                     ></div>
                  </f7-page-content>
               </f7-page>
            </f7-popup>
         </div>
      );
   };
};
