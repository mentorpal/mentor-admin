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
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/icon.png`,
      },
    },
    {
      resolve: `gatsby-plugin-env-variables`,
      options: {
        allowList: ["GRAPHQL_ENDPOINT", "CLASSIFIER_ENTRYPOINT"],
      },
    },
  ],
};
