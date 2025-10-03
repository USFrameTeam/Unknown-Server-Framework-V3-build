import * as mc from "@minecraft/server";
import {
  Land,
  USFPlayer,
  Vector
} from "../API/API.js";

let tick = 0;
//领地边界渲染范围
const render_range = 32;

//处理超出范围的点
function LandRenderPoint(vec3, player) {
  if (Vector.distance(vec3, player.location) > render_range) return;
  let molangMap = new mc.MolangVariableMap();
  molangMap.setColorRGB("variable.color", {
    red: 0.0,
    green: 1.0,
    blue: 1.0,
    alpha: 1.0
  });
  molangMap.setVector3("variable.direction", {
    x: 0,
    y: 0,
    z: 0
  });
  player.dimension.spawnParticle("minecraft:blue_flame_particle", {
    x: vec3.x,
    y: vec3.y,
    z: vec3.z
  }, molangMap);
}

mc.system.runInterval(() => {
  tick++;
  if (tick % 10 === 0) {
    for (let player of mc.world.getAllPlayers()) {
      if (player?.land?.create) {
        if (player.onScreenDisplay.isValid) {
          player.onScreenDisplay.setActionBar(`创建领地中\n请空手选择起点、终点\n打开菜单创建\n潜行打开菜单取消创建\n已选点数：${player.land.pos.length}`);
        };
        if (player.land.pos?.length >= 2) {
          //范围渲染
          let data = {
            isCreate: true,
            owner: {
              id: USFPlayer.getId(player),
              name: player.name
            },
            dimension: player.dimension,
            pos: {
              from: player.land.pos[0],
              to: player.land.pos[1]
            }
          };
          let land = new Land(data);

          //计算从哪开始渲染（坐标最小处），节约性能
          let pos_x = (((player.location.x - render_range) > land.pos.min.x) ? (player.location.x - render_range) : land.pos.min.x);
          let pos_y = (((player.location.y - render_range) > land.pos.min.y) ? (player.location.y - render_range) : land.pos.min.y);
          let pos_z = (((player.location.z - render_range) > land.pos.min.z) ? (player.location.z - render_range) : land.pos.min.z);
          //从计算坐标最小处到最大处
          for (; pos_x < (((player.location.x + render_range) > land.pos.max.x) ? land.pos.max.x : (player.location.x + render_range)); pos_x++) {
            LandRenderPoint({
              x: pos_x,
              y: land.pos.min.y,
              z: land.pos.min.z
            }, player);
            LandRenderPoint({
              x: pos_x,
              y: land.pos.max.y,
              z: land.pos.min.z
            }, player);
            LandRenderPoint({
              x: pos_x,
              y: land.pos.min.y,
              z: land.pos.max.z
            }, player);
            LandRenderPoint({
              x: pos_x,
              y: land.pos.max.y,
              z: land.pos.max.z
            }, player);
          };
          for (; pos_y < (((player.location.y + render_range) > land.pos.max.y) ? land.pos.max.y : (player.location.y + render_range)); pos_y++) {
            LandRenderPoint({
              x: land.pos.min.x,
              y: pos_y,
              z: land.pos.min.z
            }, player);
            LandRenderPoint({
              x: land.pos.max.x,
              y: pos_y,
              z: land.pos.min.z
            }, player);
            LandRenderPoint({
              x: land.pos.min.x,
              y: pos_y,
              z: land.pos.max.z
            }, player);
            LandRenderPoint({
              x: land.pos.max.x,
              y: pos_y,
              z: land.pos.max.z
            }, player);
          };
          for (; pos_z < (((player.location.z + render_range) > land.pos.max.z) ? land.pos.max.z : (player.location.z + render_range)); pos_z++) {
            LandRenderPoint({
              x: land.pos.max.x,
              y: land.pos.min.y,
              z: pos_z
            }, player);
            LandRenderPoint({
              x: land.pos.min.x,
              y: land.pos.max.y,
              z: pos_z
            }, player);
            LandRenderPoint({
              x: land.pos.min.x,
              y: land.pos.min.y,
              z: pos_z
            }, player);
            LandRenderPoint({
              x: land.pos.max.x,
              y: land.pos.max.y,
              z: pos_z
            }, player);
          }
        }
      };
      {
        let landList = Land.manager.getLandList({
          position: player.location
        });
        if (landList.length > 0) {
          if (player.onScreenDisplay.isValid) {
            player.onScreenDisplay.setActionBar(`你在{${landList[0].owner.name}}的领地中\n领地名：${landList[0].name}\n身份：${(USFPlayer.getId(player) === landList[0].owner.id ? "领地主" : "客人")}`);
          }
        }
      }
    }
  };
  if (tick % 5 === 0) {
    let scoreBoardDL = JSON.parse(mc.world.getDynamicProperty("usf:.scoreboardDefaultValue"));
    for (let sb_defaultValue of scoreBoardDL) {
      let scoreBoard = mc.world.scoreboard.getObjective(sb_defaultValue.id);
      if (scoreBoard == null) {
        scoreBoardDL = scoreBoardDL.filter(sb => {
          if (sb.id === sb_defaultValue.id) {
            return false;
          }
          return true;
        });
        mc.world.setDynamicProperty("usf:.scoreboardDefaultValue", JSON.stringify(scoreBoardDL));
        continue;
      };
      for (let player of mc.world.getAllPlayers()) {
        if (!scoreBoard.hasParticipant(player)) {
          scoreBoard.setScore(player, sb_defaultValue.value);
        }
      }
    }
  }
  if (tick === 20) tick = 0;
}, 0);