import vuetify from "eslint-plugin-vuetify";
import widgetVue3js from "@widget-lab/eslint-config-widgetlab/widget-vue3-js.js";

export default [
    ...widgetVue3js,
    ...vuetify.configs["flat/base"],
    {
        ignores: ["eslint.config.mjs", "src/static/*", "dist", "node_modules", "widget-config.js", ".gitlab-ci/*", "webpack.config.js"]
    }
];
