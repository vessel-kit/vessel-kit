module.exports = {
  hooks: {
    readPackage,
  },
};

function readPackage(pkg) {
  if (pkg.dependencies && pkg.dependencies.ses) {
    const version = pkg.dependencies.ses.split(" ")[0];
    pkg.dependencies.ses = "npm:@ukstv/ses@" + version;
  }
  return pkg;
}
