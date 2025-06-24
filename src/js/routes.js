import NotFoundPage from "../pages/404.f7.jsx";
import FormPage from "../pages/form.f7.jsx";
import HomePage from "../pages/home.f7.jsx";
import ListPage from "../pages/list.f7.jsx";
import Inbox from "../pages/inbox.f7.jsx";

export default (AB) => {
   const Application = AB.applications()[0]; // AB.applicationByID("4b7a489a-5fe5-4044-8565-aaa3654300f2");

   AB.isInitialized = false;

   AB.Network.on("reauth", () => {
      AB.isInitialized = false;
      AB.$f7.loginScreen.open("#my-login-screen");
   });

   const routes = [
      {
         path: "/",
         component: HomePage(AB),
      },
      // These (/form and /list) are temporary reference pages we are using
      // in our design. These should be removed after we have our Pages &
      // Widgets up and working:
      {
         path: "/form",
         component: FormPage(AB),
      },
      {
         path: "/list",
         component: ListPage(AB),
      },
      {
         path: "/inbox",
         component: Inbox(AB),
      },
   ];

   if (!AB.Account.isAuthenticated) return routes;

   // inbox.loadInboxData(true);

   // build our Tabs:
   // NOTE: we build links only for the Root level Tabs
   let pagesTabsRoot = Application.pages((p) => p.menuType == "tab");
   if (pagesTabsRoot.length > 0) {
      let tabRoute = {
         path: "/tabs/",
         content: "",
         tabs: [],
      };

      let content = `<div class="page">
<!--
  <div class="navbar">
    <div class="navbar-bg"></div>
    <div class="navbar-inner">
                      <div class="left">
                     <a
                        href="#"
                        data-panel=".panel-left"
                        class="link icon-only panel-open"
                     >
                        <i class="icon material-icons">menu</i>
                     </a>
                  </div>
      <div class="title">Routable Tabs</div>
    </div>
  </div>
-->
  <div class="toolbar tabbar toolbar-bottom">
    <div class="toolbar-inner">`;

      // <!-- additional "data-route-tab-id" must match to tab's ID in the specified routes -->
      pagesTabsRoot.forEach((p) => {
         content += `<a href="/tabs/${p.route}" class="tab-link" data-route-tab-id="${p.route}">${p.name}</a>`;
      });

      content += `</div>
  </div>
  <!-- Additional "tabs-routable" is required on tabs -->
  <div class="tabs tabs-routable">`;

      // Make sure ALL tabs have a defined content <div>
      let pagesTabsAll = Application.pages((p) => p.menuType == "tab", true);

      pagesTabsAll.forEach((p) => {
         content += `<div class="tab page-content" id="${p.route}">${p.name}</div>`;
         tabRoute.tabs.push(p.routeComponent());
      });

      content += `
  </div>
</div>`;

      tabRoute.content = content;

      routes.push(tabRoute);
   }

   const listPages = Application.pages((p) => p.menuType == "menu", true);

   listPages.forEach((Page) => {
      routes.push(Page.routeComponent());
   });

   // Now add the final NotFoundPage for all other references:
   routes.push({
      path: "(.*)",
      component: NotFoundPage(AB),
   });

   return routes;
};
