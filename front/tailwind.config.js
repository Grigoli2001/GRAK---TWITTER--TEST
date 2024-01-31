const withMT = require("@material-tailwind/react/utils/withMT");
const colors = require("tailwindcss/colors");

module.exports = withMT({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
    dark: {
      backgroundColor: "black",
      textColor: "white",
    },
    extend:{
      colors: {
        'twitter-blue': 'rgb(29 155 240 / <alpha-value>)',
        ...colors,
      },
      boxShadow: {
         'all-round': '2px 2px 20px -5px rgba(0, 0, 0, 0.5)'
      },
    }
    
  },
  plugins: [],
});
