// import { Formio } from "formiojs";
import { FormioToF7 } from "./componants/FormioToF7.js";

export default (AB) => {
   const L = AB.Label();
   // let lang = AB.Account.language();
   let inboxMeta = {}; // to store inboxMeta
   let inboxItems = {}; // to store inbox items
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
               // select items only match definition = process.id
               inboxItems[meta.id][process.id] = inbox.filter(
                  (item) => item.definition === process.id
               );
            });
         });
         // this._inboxData = inboxData;
      } catch (err) {
         console.error("Failed to load inbox:", err);
         inboxMeta = {};
         inboxItems = {};
      } finally {
         isLoading = false;
         // $jsx.instance.$update();
      }
   }

   async function openFormioPopup(itemsInProcess, startIndex, $f7) {
      const popup = document.getElementById("formio-popup");
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
      <div class="swiper-pagination-label margin-top margin-bottom text-align-center">
         <span id="pagination-info"></span>
      </div>
      <div class="swiper-controls text-align-center margin-top">
         <button id="prev-btn" class="button button-outline">Prev</button>
         <button id="next-btn" class="button button-outline">Next</button>
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
                  const schema = newItem?.ui || [];
                  const data = newItem?.data || {};

                  // const form = Formio.createForm(target, schema, {
                  //    readOnly: false,
                  // });
                  // form.submission = { data: schema };
                  // target.dataset.loaded = "true";

                  // Render Formio form using FormioToF7
                  const form = new FormioToF7(schema, data);
                  const formEl = form.render();
                  target.appendChild(formEl);
               } catch (e) {
                  target.innerHTML = `<div class="text-color-red text-align-center">Error loading form</div>`;
               }
               updateNavButtons(this);
            },
         },
      });

      // Attach click handlers AFTER HTML is injected
      const prevBtn = document.getElementById("prev-btn");
      const nextBtn = document.getElementById("next-btn");

      prevBtn.onclick = () => swiper.slidePrev();
      nextBtn.onclick = () => swiper.slideNext();

      // Update Prev/Next button disabled state
      function updateNavButtons(swiperInstance) {
         prevBtn.disabled = swiperInstance.isBeginning;
         nextBtn.disabled = swiperInstance.isEnd;

         const paginationInfo = document.getElementById("pagination-info");
         if (paginationInfo) {
            paginationInfo.textContent = `Item ${
               swiperInstance.activeIndex + 1
            } of ${itemsInProcess.length}`;
         }
      }

      // Trigger first form load
      swiper.emit("slideChange");
      updateNavButtons(swiper);
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
            <div class="popup tablet-fullscreen" id="formio-popup">
               <div class="page">
                  <div class="navbar">
                     <div class="navbar-inner">
                        <div class="title">Inbox item</div>
                        <div class="right">
                           <a href="#" class="link popup-close">
                              Close
                           </a>
                        </div>
                     </div>
                  </div>
                  <div class="page-content">
                     <div
                        id="formio-form-container"
                        style="padding: 10px; height:100%"
                     ></div>
                  </div>
               </div>
            </div>
         </div>
      );
   };
};
