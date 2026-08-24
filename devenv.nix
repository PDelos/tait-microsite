{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  # Install Bun via Nix
  packages = [ pkgs.bun ];

  # Set default environment variables
  env = {
    DATABASE_PATH = "./data/tait.db";
    ADMIN_PASSWORD = "dev-admin-secret-password";
  };

  # Enable automated pre-commit hooks via devenv
  git-hooks.hooks = {
    nixfmt.enable = true;
    prettier.enable = true;
    eslint.enable = true;
  };

  # Helpful developer scripts
  scripts.dev.exec = "bun run --bun dev";
  scripts.lint.exec = "bun run check && bun run lint";
}
