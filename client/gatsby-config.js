module.exports = {
  pathPrefix: `/admin`,
  siteMetadata: {
    title: `Chat`,
    description: ``,
    author: `@gatsbyjs`,
    siteUrl: `https://uscquestions.mentorpal.org/admin`,
  },
  plugins: [
    `gatsby-plugin-sitemap`,
    `gatsby-plugin-typescript`,
    {
      resolve: "gatsby-plugin-material-ui",
    },
    {
      resolve: `gatsby-plugin-env-variables`,
      options: {
        allowList: [
          "GRAPHQL_ENDPOINT",
          "STAGE",
          "IS_SENTRY_ENABLED",
          "SBERT_ENDPOINT",
          "LRS_USERNAME",
          "LRS_PASSWORD",
          "LRS_ENDPOINT"
        ],
      },
    },
    {
      resolve: "gatsby-plugin-eslint",
      options: {
        test: /\.js$|\.jsx$|\.ts$|\.tsx$/,
        exclude: /(node_modules|.cache|public|static)/,
        stages: ["develop"],
        options: {
          emitWarning: true,
          failOnError: false,
        },
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/favicon.png",
      },
    },
  ],
};
