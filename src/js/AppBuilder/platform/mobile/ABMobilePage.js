import ABMobilePageCore from "../../core/mobile/ABMobilePageCore";

export default class ABMobilePage extends ABMobilePageCore {
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

   show(showBack = false) {
      // TODO: figure out the different Page display options
      // and update this call to properly intro the page:

      let route = `/${this.route}`;
      if (this.menuType == "tab") {
         route = `/tabs/${this.route}`;
      }
      this.AB.$f7.view.main.router.navigate(route, {
         props: {
            /* This shows up as [props] in our .component definition */
            showBack,
            // data: item,
            // isEditMode: true,
            // transition: "f7-fade", // Q? Should we offer transition Options on a Page?
         },
         ignoreCache: true,
      });
   }

   viewHTML($h) {
      let allResults = [];

      this.views().forEach((v) => {
         allResults.push(v.html($h));
      });

      return allResults.map((r) => r()); // render each jsx template
   }

   routeComponent() {
      return {
         path: `/${this.route}`,
         id: this.route,
         component: (props, { $, $h, $f7, $on, $store, $update }) => {
            const L = this.AB.Label();
            const title = this.label;
            let allGetters = {};
            // this.inboxBadge = 0;

            // NOTE: this can be redundant, but on the ABDesigner we
            // will load a specific page directly and doing this will
            // make sure the ABFactory is properly populated:
            this.AB.$ = $;
            this.AB.$f7 = $f7;
            this.AB.$store = $store;

            // NOTE: Programming Quirk:
            // We seem to need to access our getters for this Page from
            // within this PageComponent definition.  (maybe) this is how
            // it registers the components that need to be redrawn when the
            // related state is updated.
            let allViews = this.views();

            allViews.forEach((v) => {
               let dc = v.datacollection;
               if (dc) {
                  dc.init();
                  allGetters[dc.id] = $store.getters[dc.id];
               }
            });

            const loadInboxBadge = async () => {
               const inboxConfig = await this.AB.Network.get({
                  url: "/config/inbox",
               });
               this.inboxBadge = (inboxConfig.inbox || []).length;
               $update();
            };

            $on("pageInit", async (e, page) => {
               const pendingInit = [];
               allViews.forEach((v) => {
                  let dc = v.datacollection;
                  // dc?.init();

                  const viewInit = async (v, callback) => {
                     await v.init();
                     callback();
                  };
                  const init = () =>
                     new Promise((resolve) => {
                        // wait for DC to be initialized before
                        // initializing the view.
                        if (dc && !dc.isDataInitialized) {
                           dc.on("initializedData", () => {
                              viewInit(v, resolve);
                           });
                           $store.dispatch("getAppBuilderData", dc.id);
                           return;
                        }

                        viewInit(v, resolve);
                     });

                  pendingInit.push(init());
               });

               pendingInit.push(loadInboxBadge());

               await Promise.all(pendingInit);
            });

            $on("pageBeforeRemove", () => {
               allViews.forEach((v) => {
                  v.destroy();
               });
            });

            ///
            /// Add Button
            ///

            //             const viewAddButton = () => {
            //                // Decide wether or not to display the Add button.

            //                if (!widgetAdd) return ``;

            //                return $h`
            //                <div class="right">
            //                      <a
            //                         href="#"
            //                         data-panel=".panel-right"
            //                         class="link icon-only"
            //                         onclick=${() => {
            //                            // tell the widget to open it's ADD page.
            //                            widgetAdd.openAddPage();
            //                            // this.AB.$f7.view.main.router.navigate("/form", {
            //                            //    props: {
            //                            //       isEditMode: false,
            //                            //    },
            //                            //    ignoreCache: true,
            //                            // });
            //                         }}
            //                      >
            //                         <i class="icon f7-icons if-not-md">plus</i>
            //                         <i class="icon material-icons md-only">add</i>
            //                      </a>
            //                   </div>
            // `;
            //             };

            ///
            /// Tabs
            ///

            let pagesTabs = this.application.pages((p) => p.menuType == "tab");
            // {array} {ABMobilePage}
            // The pages that are defined as Tabs in this application.

            let tabContent = (p) => {
               // return the link for a Tab
               // @param {ABMobilePage} that represents the Tab Page
               return $h`<a href="/tabs/${p.route}" class="tab-link" data-route-tab-id="${p.route}">${p.name}</a>`;
            };

            let viewTabs = () => {
               // return the block of HTML for the Tabs on the bottom of a Page
               // if there are no tabs, then this is empty.
               if (pagesTabs.length == 0 || this.settings.hideTabs) return "";

               return $h`<div class="toolbar tabbar toolbar-bottom">
                   <div class="toolbar-inner">
                   ${pagesTabs.map((p) => tabContent(p))}
                   </div>
                 </div>`;
            };

            ///
            /// Menu or Back
            ///
            const menu = () => {
               if (!props.showBack) {
                  return $h`<a
                        href="#"
                        data-panel=".panel-left"
                        class="link icon-only panel-open"
                     >
                        <i class="icon material-icons">menu</i>
                     </a>`;
               }

               return $h`<a href="#" class="link back">
                        <i class="icon icon-back"></i>
                        <span class="if-not-md">${L("Back")}</span>
                     </a>`;
            };

            ///
            /// Title
            ///

            const pageTitle = () => {
               // An ABMobilePage can optionally NOT display a title.

               if (this.settings.hideTitle) {
                  return "";
               }

               return $h`<div class="title">${title}</div>
                  <div class="title-large">
                     <div class="title-large-text">${title}</div>
                  </div>`;
            };
            ///
            /// Inbox
            ///
            const inbox = () => {
               if (this.inboxBadge > 0) {
                  return $h`<a href="/inbox" class="link icon-only">
                        <i class="icon material-icons">mail<span class="badge color-red">${this.inboxBadge}</span></i>
                     </a>`;
               }
               return $h`<a href="/inbox" class="link icon-only"><i class="icon material-icons">mail</i></a>`;
            };

            return () => $h`
         <div class="page" data-name="${this.route}">
            <div class="navbar">
               <div class="navbar-bg"></div>
               <div class="navbar-inner">
                  <div class="left">
                     ${menu()}
                  </div>
                  ${pageTitle()}
                  <div class="right">
                    ${inbox()}
                  </div>
               </div>
            </div>
            <div class="page-content">
            ${this.viewHTML($h)}
            </div>
            ${viewTabs()}
         </div>
      `;
         },
      };
   }
}
