module.exports = {
  launchers: {
    Node: {
      command: "npm run test",
      protocol: "tap"
    }
  },
  src_files: [
    "src/**/*.js",
    "tests/**/*.js"
  ],
  launch_in_ci:  [ "Node" ],
  launch_in_dev:  [ "Node" ]
};
