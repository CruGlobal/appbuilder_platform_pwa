export default (AB) => {
   const Application = AB.applications()[0]; // AB.applicationByID("4b7a489a-5fe5-4044-8565-aaa3654300f2");
   const L = AB.Label();

   return (props, { $, $h, $f7, $on, $store, $update }) => {
      // Login screen demo data
      // let path = document?.location?.pathname ? document.location.pathname : "/";
      let defaultPath = "/";
      let username = "";
      let password = "";
      let versionNumber = Application?.version;
      let showingUpdate = false;
      let apiUrl = document?.location?.origin ?? "http://localhost:8080";
      // process.env.NODE_ENV === "production"
      //    ? "https://design.digiserve.org"
      //    : "http://localhost:8010/proxy";

      // check for a specified Route:
      let params = new URL(document.location).searchParams;
      let route = params.get("route");
      if (route) {
         defaultPath = `/${route}`;
      }

      $store.dispatch("getVersion");

      $on("pageInit", () => {
         // checkForUpdate();
      });

      document.addEventListener("visibilitychange", (e) => {
         if (document.visibilityState == "visible") {
            checkForUpdate();
         }
      });

      const updatePassword = (e) => {
         password = $("#" + e).value();
         $update();
      };

      const close = (e) => {
         $f7.loginScreen.close("#my-login-screen");
      };

      const logout = () => {
         $f7.loginScreen.open("#my-login-screen");
         // $f7.preloader.show();
         // password = "";
         // $update();
         // fetchJson(Api.urls.logout, { method: 'GET' })
         //   .then(data => {
         //     store.dispatch('addCsrfToken', "");
         //     $f7.loginScreen.open("#my-login-screen");
         //     $f7.preloader.hide();
         //   })
         //   .catch(err => {
         //     console.error("logout failed but pretending it didn't");
         //     store.dispatch('addCsrfToken', "");
         //     $f7.loginScreen.open("#my-login-screen");
         //     $f7.preloader.hide();
         //   });
      };

      const authenticate = async () => {
         $(".button-preloader").addClass("button-loading");
         let tempUser = $("#username").value();
         try {
            var data = await AB.Network.post({
               url: apiUrl + "/auth/login",
               params: {
                  email: tempUser,
                  password: $("#password").value(),
               },
            });

            $store.dispatch("setUser", data.user);
            // $store.dispatch("setUsername", $("#username").value());

            // Now attempt to ensure our cookie is set:
            // var result = await AB.Network.get({
            //    url: `${apiUrl}/__getCookie`,
            // });

            $("#password")[0].value = "";
            $f7.loginScreen.close();
            $(".button-preloader").removeClass("button-loading");

            AB.isInitialized = true;

            await checkForUpdate();

            // NOTE: replace this with:
            // const Page = Application.pageByID(LastViewedPageID);
            // Page.openView();
            $f7.view.main.router.navigate("/list", {
               transition: "f7-fade",
            });
         } catch (err) {
            $f7.toast
               .create({
                  icon: '<i class="material-icons">error</i>',
                  text: L("Login Failed"),
                  position: "center",
                  closeTimeout: 2000,
               })
               .open();
            $(".button-preloader").removeClass("button-loading");
         }
      };

      const showPasswordPreview = (e) => {
         $("#passwordPreviewHolder").show();
         $("#passwordHolder").hide();
         $("#passwordPreview").focus();
      };

      const showPassword = (e) => {
         $("#passwordHolder").show();
         $("#passwordPreviewHolder").hide();
         $("#password").focus();
      };

      async function checkForUpdate() {
         if (!showingUpdate) {
            let getVersionPath = `${apiUrl}${Application?.urlCurrentVersion}`;

            const response = await AB.Network.get({ url: getVersionPath });
            const version = response?.version ?? "0.0.0";
            const currVersion = Application?.version;
            console.log("getVersionPath: ", version);
            console.log("getCurrVersion: ", currVersion);
            if (currVersion.trim() != version.trim()) {
               showingUpdate = true;
               if ("serviceWorker" in navigator) {
                  $f7.dialog
                     .create({
                        title: L(`Update Available`),
                        content: L(
                           `There is an app update avaiable, tap "Update" to get the latest version.`
                        ),
                        buttons: [
                           {
                              text: L("Cancel"),
                              onClick: function (dialog, e) {
                                 showingUpdate = false;
                              },
                           },
                           {
                              text: L(`Update to version {0}`, [version]),
                              bold: true,
                              cssClass: "bg-color-primary text-color-white",
                              onClick: function (dialog, e) {
                                 $f7.progressbar.show();
                                 navigator.serviceWorker
                                    .getRegistrations()
                                    .then(function (registrations) {
                                       let complete = registrations.length;
                                       let index = 0;
                                       for (let registration of registrations) {
                                          registration
                                             .unregister()
                                             .then((boolean) => {
                                                index++;
                                                if (index == complete) {
                                                   showingUpdate = false;
                                                   window.location.reload(true);
                                                }
                                             });
                                       }
                                       if (complete == 0) {
                                          showingUpdate = false;
                                          window.location.reload(true);
                                       }
                                    });
                              },
                           },
                        ],
                        verticalButtons: true,
                     })
                     .open();
               }
            } else {
               // alert("up to date");
            }
         }
      }

      let pagesMenu = Application?.pages((p) => p.menuType == "menu") ?? [];
      return () => (
         <div id="app">
            {/* Left panel with cover effect */}
            <div class="panel panel-left panel-cover dark panel-init">
               <div class="view">
                  <div class="page bg-color-primary">
                     <div class="navbar">
                        <div class="navbar-bg"></div>
                        <div class="navbar-inner">
                           <div class="title">
                              {Application?.label ?? L("PWA")}
                           </div>
                        </div>
                     </div>
                     <div class="page-content">
                        <div class="block text-align-center no-margin-bottom">
                           {/* block content */}
                           <img
                              src="assets/mobile/images/digiServe_logo.png"
                              width="70%"
                              class="sidebar_logo"
                           />
                           <p></p>
                        </div>
                        <div class="list list-outline list-strong list-dividers list-translucent">
                           <ul>
                              {pagesMenu.map((p) => {
                                 return (
                                    <li>
                                       <a
                                          href={`/${p.route}`}
                                          class="item-link item-content panel-close"
                                       >
                                          <div class="item-media">
                                             <i class="material-icons">
                                                {p.label}
                                             </i>
                                          </div>
                                          <div class="item-inner">
                                             <div class="item-title">
                                                {p.label}
                                             </div>
                                          </div>
                                       </a>
                                    </li>
                                 );
                              })}

                              <li>
                                 <a
                                    href="#"
                                    class="item-link item-content"
                                    onClick={() => logout()}
                                 >
                                    <div class="item-media">
                                       <i class="material-icons">
                                          {L("logout")}
                                       </i>
                                    </div>
                                    <div class="item-inner">
                                       <div class="item-title">
                                          {L("Log out")}
                                       </div>
                                    </div>
                                 </a>
                              </li>
                           </ul>
                        </div>
                        <div
                           class="block text-align-center"
                           style="position: absolute; width: 100%; margin-bottom: 15px; bottom: 0px;"
                        >
                           <p>
                              <img
                                 src="assets/mobile/images/digiServe_logo.png"
                                 width="30%"
                              />
                              <br />
                              <span class="version">v{versionNumber}</span>
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Your main view, should have "view-main" class */}
            <div
               class="view view-main view-init safe-areas"
               data-url={defaultPath}
            ></div>

            {/* Login Screen */}
            <div class="login-screen" id="my-login-screen">
               <div class="view">
                  <div class="page bg-color-primary dark">
                     <div class="page-content login-screen-content bg-color-primary">
                        <div class="block text-align-center no-margin-bottom">
                           <img
                              src="assets/mobile/images/digiServe_logo.png"
                              width="60%"
                              class="sidebar_logo"
                           />
                        </div>
                        <form
                           action="javascript: null;"
                           onSubmit={() => authenticate()}
                        >
                           <div class="list">
                              <ul>
                                 <li class="item-content item-input">
                                    <div class="item-inner">
                                       <div class="item-title item-label">
                                          {L("E-mail")}
                                       </div>
                                       <div class="item-input-wrap">
                                          <input
                                             autocorrect="off"
                                             autocomplete="username"
                                             spellcheck="false"
                                             type="text"
                                             id="username"
                                             name="username"
                                             placeholder={L(
                                                "Your e-mail address"
                                             )}
                                          />
                                          <span class="input-clear-button"></span>
                                       </div>
                                    </div>
                                 </li>
                                 <li
                                    id="passwordHolder"
                                    class="item-content item-input"
                                 >
                                    <div class="item-inner">
                                       <div class="item-title item-label">
                                          {L("Password")}
                                       </div>
                                       <div class="item-input-wrap">
                                          <a
                                             onClick={() =>
                                                showPasswordPreview()
                                             }
                                             style="color: var(--f7-input-clear-button-color); position: absolute; right: 0; padding: 10px; margin-right: -15px; margin-top: -5px;"
                                             href="#"
                                          >
                                             <i class="material-icons">
                                                visibility_off
                                             </i>
                                          </a>
                                          <input
                                             type="password"
                                             id="password"
                                             name="password"
                                             placeholder={L("Your password")}
                                             value={password}
                                             onInput={() =>
                                                updatePassword("password")
                                             }
                                             autocomplete="current-password"
                                             autocorrect="off"
                                             spellcheck="false"
                                          />
                                       </div>
                                    </div>
                                 </li>
                                 <li
                                    id="passwordPreviewHolder"
                                    style="display: none;"
                                    class="item-content item-input"
                                 >
                                    <div class="item-inner">
                                       <div class="item-title item-label">
                                          {L("Password")}
                                       </div>
                                       <div class="item-input-wrap">
                                          <a
                                             onClick={() => showPassword()}
                                             style="color: var(--f7-input-clear-button-color); position: absolute; right: 0; padding: 10px; margin-right: -15px; margin-top: -5px;"
                                             href="#"
                                          >
                                             <i class="material-icons">
                                                visibility
                                             </i>
                                          </a>
                                          <input
                                             type="text"
                                             id="passwordPreview"
                                             name="passwordPreview"
                                             placeholder={L("Your password")}
                                             value={password}
                                             onInput={() =>
                                                updatePassword(
                                                   "passwordPreview"
                                                )
                                             }
                                             autocomplete="current-password"
                                             autocorrect="off"
                                             spellcheck="false"
                                          />
                                       </div>
                                    </div>
                                 </li>
                                 <li class="item-content item-input"></li>
                              </ul>
                           </div>
                           <div class="block">
                              <button class="button color-primary button-outline button-round bg-color-white button-large login-button button-preloader">
                                 <div class="preloader">
                                    <span class="preloader-inner">
                                       <span class="if-ios">
                                          <span class="preloader-inner-line"></span>
                                          <span class="preloader-inner-line"></span>
                                          <span class="preloader-inner-line"></span>
                                          <span class="preloader-inner-line"></span>
                                          <span class="preloader-inner-line"></span>
                                          <span class="preloader-inner-line"></span>
                                          <span class="preloader-inner-line"></span>
                                          <span class="preloader-inner-line"></span>
                                       </span>
                                       <span class="if-md">
                                          <svg viewBox="0 0 36 36">
                                             <circle
                                                cx="18"
                                                cy="18"
                                                r="16"
                                             ></circle>
                                          </svg>
                                       </span>
                                       <span class="if-aurora">
                                          <span class="preloader-inner-circle"></span>
                                       </span>
                                    </span>
                                 </div>
                                 <span>{L("Sign In")}</span>
                              </button>
                           </div>
                        </form>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   };
};
