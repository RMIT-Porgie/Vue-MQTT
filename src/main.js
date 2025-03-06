// import 3ddashboard utils before imports requiring static resources (such as vuetify webfonts)
import { createApp } from "vue";
import { createPinia } from "pinia";
import { disableDefaultCSS, onVisibilityChange, requirejs, widget } from "@widget-lab/3ddashboard-utils";
import App from "@/App.vue";  // Changed from MyApp to App
import vuetify from "@/plugins/vuetify";
import "@/scss/index.scss";
import router from "./router";

const app = createApp(App);  // Changed from MyApp to App
app.use(router);
app.use(createPinia());
app.use(vuetify);
app.mount("my-app");

const start = () => {
    disableDefaultCSS(true);

    widget.setTitle("Sensor Data");

    requirejs(["DS/PlatformAPI/PlatformAPI"], (/* PlatformAPI */) => {
        // use 3DDashboard APIs
    });

    onVisibilityChange((/* visibility */) => {
        // widget (or fullpage) visibility has changed
        // you can enable/disable periodic data refresh based on visibility
    });
};

/**
 * Entry point for both standalone & 3DDashboard modes
 */
widget.addEvent("onLoad", () => {
    start();
});

widget.addEvent("onRefresh", () => {
    // TODO an application data refresh
    // meaning only refresh dynamic content based on remote data, or after preference changed.
    // we could reload the frame [ window.location.reload() ], but this is not a good practice, since it reset preferences
});
