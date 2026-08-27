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
    DATABASE_URL = "postgresql://neondb_owner:npg_kHihF35oVaJu@ep-mute-bird-b1dzgdwk-pooler.c-5.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
    ADMIN_PASSWORD = "10tait-2026";
    BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_kRWlkd41GhkXj9VU_aKC250NegiOnRw6bUpiEXoZtjk5AUP";
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
