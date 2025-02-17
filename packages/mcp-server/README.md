# mcp-server

## How to use it

Build the mcp server and then open Claude's configuration file:

```
code /Users/<your-username>/Library/Application Support/Claude/claude_desktop_config.json
```

Add :

```json
{
  "mcpServers": {
    "device-shaper": {
      "command": "node",
      "args": ["/absolute-path-to-repository/mcp-server/build/index.js"]
    }
  }
}
```

## TODO

- [ ] Fix building issues
- [ ] Check how claude can call the tools
