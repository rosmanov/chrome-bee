-- Project-local configuration for bee-host
-- Disable auto-formatting
vim.b.disable_autoformat = true

-- Set up auto-formatting to use clang-format with GNU style, matching Neovim's editing indentation
vim.g.project_formatters_by_ft = {
  css = { "prettier" },
  javascript = { "prettier" },
}

vim.g.project_custom_formatters = {
}

-- Ensure LSP (clangd) formatting falls back to the exact same style when triggered manually
vim.g.project_lsp_servers = {
}

-- Neovim editor configuration
local function apply_js_settings()
  -- Disable Treesitter indentation only for this project's buffers
  vim.opt_local.indentexpr = ""

  local opt = vim.opt_local
  --opt.autoindent = true
  --opt.smartindent = false
  --opt.cindent = false
  opt.shiftwidth = 2
  opt.softtabstop = 2
  opt.tabstop = 2
  opt.expandtab = true
  opt.textwidth = 79

  -- Code folding
  opt.foldmethod = "marker"
end

-- Safely run configuration without affecting other Neovim tasks
pcall(function()
  -- Apply immediately if the current buffer is already a JavaScript file
  if vim.tbl_contains({ "javascript" }, vim.bo.filetype) then
    vim.schedule(apply_js_settings)
  end

  -- Set up local autocommand for any C/C++ files opened during this session
  local group = vim.api.nvim_create_augroup("ProjectCConfig", { clear = true })
  vim.api.nvim_create_autocmd("FileType", {
    group = group,
    pattern = { "javascript" },
    callback = function()
      -- vim.schedule defers execution, guaranteeing that our settings
      -- run AFTER Treesitter finishes loading and sets its indentexpr.
      vim.schedule(apply_js_settings)
    end,
  })
end)
