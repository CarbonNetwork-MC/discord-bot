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
