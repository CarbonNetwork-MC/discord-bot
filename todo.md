# Table of Contents
1. Systems
2. [Events](#events)
3. [Commands](#commands)

## Systems
- Autorole
- Reaction Roles
- Modlog (See [Events](#events))
- Commands (See [Commands](#commands))
- Sticky Roles
- Chat filter?

## Events
| **#** | **Priority** | **Event** | **Joinlog** | **Done** |
|---|---|---|---|---|
| **1** | 1 | MessageDelete |  | ✓ |
| **2** | 1 | MessageBulkDelete |  | ✓ |
| **3** | 1 | MessageUpdate |  | ✓ |
| **4** | 1 | GuildMemberAdd | ✓ | ✓ |
| **5** | 1 | GuildMemberRemove | ✓ | ✓ |
| **6** | 1 | GuildMemberUpdate |  | ✓ |
| **7** | 1 | GuildBanAdd |  | ✓ |
| **8** | 1 | GuildBanRemove |  | ✓ |
| **9** | 2 | GuildRoleCreate |  | ✓ |
| **10** | 2 | GuildRoleDelete |  | ✓ |
| **11** | 2 | GuildRoleUpdate |  |  |
| **12** | 2 | InviteCreate |  |  |
| **13** | 2 | InviteDelete |  |  |
| **14** | 3 | ThreadCreate |  |  |
| **15** | 3 | ThreadDelete |  |  |
| **16** | 3 | ThreadUpdate |  |  |
| **17** | 3 | GuildEmojisUpdate |  |  |
| **18** | 3 | GuildStickersUpdate |  |  |
| **19** | 3 | GuildScheduledEventCreate |  |  |
| **20** | 3 | GuildScheduledEventDelete |  |  |
| **21** | 3 | GuildScheduledEventUpdate |  |  |
| **22** | 4 | UserUpdate |  |  |

## Commands
- Replace `prune` with `purge` (see images below)
- Kick
- Warn
- Nick/unnick
- Mute/unmute

![Purge Preview](/docs/images/purge_1.png)
![Purge Preview](/docs/images/purge_2.png)

## Other
- Add a 'isDev' parameter to all commands, when the bot is in development these commands will only deploy to the development server and not globally. Also only developers will be able to execute these commands.

## How commands should be deployed
| Command | Development | Production |
| ----- | ----- | ----- |
| `isDev: true` & `servers: null` | Dev Server | Dev Server |
| `isDev: false` & `servers: null` | Both | Both |
| `isDev: true` & `servers: ['Dev_id']` | Dev Server | Not deployed |
| `isDev: true` & `servers: ['Dev_id', 'Server_A']` | Dev Server | Dev Server |
| `isDev: false` & `servers: ['Dev_id', 'Server_A']` | Dev Server | All servers in the servers array |
| `isDev: false` & `servers: ['Server_A']` | Not deployed | All servers in the servers array |
| `isDev` & `servers` missing | Not deployed + warning | Not deployed + warning |