const devConf = require("@widget-lab/widget-templates-webpack-configs/webpack.config.dev");
const devS3Conf = require("@widget-lab/widget-templates-webpack-configs/webpack.config.dev-s3");
const prod = require("@widget-lab/widget-templates-webpack-configs/webpack.config.prod");

const { VueLoaderPlugin } = require("vue-loader");
const { VuetifyPlugin } = require("webpack-plugin-vuetify");

const { merge } = require("webpack-merge");
const path = require("path");

const vueConf = {
    module: {
        rules: [{ test: /\.vue$/, loader: "vue-loader" }]
    },
    plugins: [new VueLoaderPlugin()]
};

const vuetifyConf = {
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader"
                ]
            }
        ]
    },
    plugins: [new VuetifyPlugin()]
};

/**
 * use this object to override our settings
 */
const myConf = {
    entry: "/src/main.js",
    resolve: {
        extensions: [".js", ".vue", ".json", ".mjs"],
        alias: {
            "@": path.resolve("src")
        }
    }
};

module.exports = [
    { name: "dev", ...merge(devConf, vueConf, vuetifyConf, myConf) },
    { name: "devS3", ...merge(devS3Conf, vueConf, vuetifyConf, myConf) },
    { name: "prod", ...merge(prod, vueConf, vuetifyConf, myConf) }
];
