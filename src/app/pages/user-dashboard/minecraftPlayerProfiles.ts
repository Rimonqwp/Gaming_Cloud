// Local Minecraft demo profiles; replace with server UUIDs and skin URLs from the player API.
export type MinecraftPlayerProfile = {
  gameId: string; uuid: string; skinAvatar: string; clientVersion: string; ping: number;
  world: string; position: string; firstJoined: string;
};

export const minecraftPlayerProfiles: Record<string, MinecraftPlayerProfile> = {
  "76561198000000001": {
    "gameId": "XiaoPapa",
    "uuid": "c3ffe9e5-8f24-4c21-9a7e-f9afda77817a",
    "skinAvatar": "/console/minecraft/avatar-1.png",
    "clientVersion": "1.20.4",
    "ping": 24,
    "world": "主世界",
    "position": "128, 64, -256",
    "firstJoined": "2024-10-12 19:30"
  },
  "76561198000000002": {
    "gameId": "SkyCity",
    "uuid": "e7d6d987-0376-4e97-a494-ddcd10505abe",
    "skinAvatar": "/console/minecraft/avatar-2.png",
    "clientVersion": "1.20.4",
    "ping": 38,
    "world": "主世界",
    "position": "342, 72, 118",
    "firstJoined": "2024-10-13 19:30"
  },
  "76561198000000003": {
    "gameId": "MeowCat",
    "uuid": "320567f0-9f66-493d-8235-a7376fd43dfe",
    "skinAvatar": "/console/minecraft/avatar-4.png",
    "clientVersion": "1.20.4",
    "ping": 52,
    "world": "下界",
    "position": "-64, 45, 96",
    "firstJoined": "2024-10-14 19:30"
  },
  "76561198000000004": {
    "gameId": "StarTraveler",
    "uuid": "83f2d96a-b87c-4997-9361-95d976b370c5",
    "skinAvatar": "/console/minecraft/avatar-2.png",
    "clientVersion": "1.20.4",
    "ping": 31,
    "world": "主世界",
    "position": "86, 70, 215",
    "firstJoined": "2024-10-15 19:30"
  },
  "76561198000000005": {
    "gameId": "DarkKnight",
    "uuid": "71ec8b2c-285c-43bf-9cf0-c70589a9cba1",
    "skinAvatar": "/console/minecraft/avatar-4.png",
    "clientVersion": "1.20.4",
    "ping": 46,
    "world": "末地",
    "position": "105, 62, -43",
    "firstJoined": "2024-10-12 19:30"
  },
  "76561198000000006": {
    "gameId": "CokeNoIce",
    "uuid": "e6ae2785-0dcd-4dbb-a684-fc47ba54da67",
    "skinAvatar": "/console/minecraft/avatar-3.png",
    "clientVersion": "1.20.4",
    "ping": 28,
    "world": "主世界",
    "position": "212, 65, 87",
    "firstJoined": "2024-10-16 19:30"
  },
  "76561198000000007": {
    "gameId": "YamadaTaro",
    "uuid": "3bb52f26-834b-4313-be41-87550d781753",
    "skinAvatar": "/console/minecraft/avatar-1.png",
    "clientVersion": "1.20.4",
    "ping": 35,
    "world": "主世界",
    "position": "-152, 68, 326",
    "firstJoined": "2024-10-18 19:30"
  },
  "76561198000000008": {
    "gameId": "Moonlight",
    "uuid": "6390cf18-2958-47b7-9842-79a7339e33e2",
    "skinAvatar": "/console/minecraft/avatar-4.png",
    "clientVersion": "1.20.4",
    "ping": 42,
    "world": "下界",
    "position": "28, 54, -112",
    "firstJoined": "2024-10-13 19:30"
  }
};
