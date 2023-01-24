const path = require("path");

exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  config = {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      modules: [path.resolve(__dirname, "src"), "node_modules"],
    },
  };
  // Replace this module with a dummy module during SSR since it expects browser to always be available https://www.gatsbyjs.com/docs/debugging-html-builds/#fixing-third-party-modules
  if (stage === "build-html" || stage === "develop-html") {
    config["module"] = {
      rules: [
        {
          test: /react-draft-wysiwyg/,
          use: loaders.null(),
        },
        {
          test: /danfojs/,
          use: loaders.null(),
        },
        {
          test: /xapi/,
          use: loaders.null(),
        },
      ],
    };
  }
  actions.setWebpackConfig(config);
};
