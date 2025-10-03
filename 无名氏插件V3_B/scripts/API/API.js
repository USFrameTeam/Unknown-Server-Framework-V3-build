import * as mc from "@minecraft/server"
//0-37778931862957161709568
export function UUID() {
  let time = new Date().getTime();
  let string_uuid = "";
  for (let i = 0; i < 36; i++) {
    let rs = Math.round((time % 100 * 0.01 + Math.random()) * 0.5 * 15);
    string_uuid += ((i == 8 || i == 13 || i == 18 || i == 23) ? '-' : (rs <= 9 ? String.fromCharCode(rs + 48) : String.fromCharCode(87 + rs)));
  };
  return string_uuid;
}

export class Vector {
  static add(vector1, vector2) {
    return {
      x: vector1.x + vector2.x,
      y: vector1.y + vector2.y,
      z: vector1.z + vector2.z
    };
  };
  //获取距一点距离为theDistance，角度xz处的坐标
  static faceLocation(theVector, theDistance, theRotation) {
    let faceVector_y = (theVector.y - Math.sin(theRotation.x * Math.PI / 180) * theDistance);
    let faceVector_r = (Math.cos(theRotation.x * Math.PI / 180) * theDistance);
    let faceVector_x = (theVector.x - faceVector_r * Math.sin(theRotation.y * Math.PI / 180));
    let faceVector_z = (theVector.z + faceVector_r * Math.cos(theRotation.y * Math.PI / 180));
    let finallyVector = {
      x: faceVector_x,
      y: faceVector_y,
      z: faceVector_z
    };
    return finallyVector;
  };
  //乘
  static mul(vector, num) {
    return {
      x: vector.x * num,
      y: vector.y * num,
      z: vector.z * num
    };
  };
  //距离
  static distance(Vector1, Vector2) {
    let TheDistance = Math.sqrt(Math.pow((Vector1.x - Vector2.x), 2) + Math.pow((Vector1.y - Vector2.y), 2) + Math.pow((Vector1.z - Vector2.z), 2));
    return TheDistance;
  }
};

export class Log {
  static error(message) {
    console.error(message);
  }
  static log(message) {
    console.log(message);
  }
  static warn(message) {
    console.warn(message);
  }
};

export class Land {
  /*
    data: {
      pos : {
        from: Vector3,
        to: Vector3
      },
      owner: {
        id: USFPlayer.getId(player);
        name: player.name
      }
    }
  */
  constructor(data) {
    //破坏方块 放置方块 与实体交互 与方块交互
    this.setting = {
      canBreak: false,
      canPlace: false,
      canIEntity: false,
      canIBlock: false
    };
    if(data.name){
      this.name = data.name;
    }
    this.id = (data.id == undefined ? UUID() : data.id);
    //mc.world.sendMessage(this.id);
    this.member = [];
    this.owner = data.owner;
    if (data.isCreate === true) {
      this.dimensionId = data.dimension.id;
      this.pos = {
        max: {
          x: (data.pos.from.x > data.pos.to.x ? data.pos.from.x : data.pos.to.x) + 1,
          y: (data.pos.from.y > data.pos.to.y ? data.pos.from.y : data.pos.to.y) + 1,
          z: (data.pos.from.z > data.pos.to.z ? data.pos.from.z : data.pos.to.z) + 1
        },
        min: {
          x: (data.pos.from.x < data.pos.to.x ? data.pos.from.x : data.pos.to.x),
          y: (data.pos.from.y < data.pos.to.y ? data.pos.from.y : data.pos.to.y),
          z: (data.pos.from.z < data.pos.to.z ? data.pos.from.z : data.pos.to.z)
        }
      };
    } else {
      this.pos = data.pos;
      this.dimensionId = data.dimensionId;
    };
    //这玩意好像没用，但看EarthDLL代码中有就写了
    this.centerPos = {
      x: (this.pos.max.x + this.pos.min.x) / 2,
      y: (this.pos.max.y + this.pos.min.y) / 2,
      z: (this.pos.max.z + this.pos.min.z) / 2
    };
    
    if (data.member !== undefined) {
      this.member = data.member;
    };
    
    if (data.setting !== undefined) {
      this.setting = data.setting;
    };
  };
  //在领地内
  inLand(pos) {
    if ((pos.x >= this.pos.min.x) && (pos.x <= this.pos.max.x) && (pos.y >= this.pos.min.y) && (pos.y <= this.pos.max.y) && (pos.z >= this.pos.min.z) && (pos.z <= this.pos.max.z)) {
      return true;
    }
    return false;
  };
  //与另一个领地重叠
  coincide(oland) {
    if (this.dimensionId !== oland.dimensionId){
      return false;
    } else if (((this.pos.min.x > oland.pos.max.x) || (this.pos.max.x < oland.pos.min.x)) || ((this.pos.min.y > oland.pos.max.y) || (this.pos.max.y < oland.pos.min.y)) || ((this.pos.min.z > oland.pos.max.z) || (this.pos.max.z < oland.pos.min.z))) {
      return false;
    } else {
      return true;
    }
  };
  //与所有领地重叠
  static coincide_allLand(oland) {
    let landList = Land.manager.getLandList();
    for (let land of landList) {
      if (land.coincide(oland)) {
        return true;
      }
    };
    return false;
  };
  static manager = {
    addLand(land) {
      let landList = JSON.parse(mc.world.getDynamicProperty("usf:landList"));
      landList.push(land);
      //mc.world.sendMessage(JSON.stringify(landList));
      mc.world.setDynamicProperty("usf:landList", JSON.stringify(landList));
    },
    removeLand(land) {
      let landObjList = JSON.parse(mc.world.getDynamicProperty("usf:landList"));
      let landList = landObjList.filter((e) => {
        if (e.id === land.id) {
          return false;
        }
        return true;
      });
      mc.world.setDynamicProperty("usf:landList", JSON.stringify(landList));
    },
    getLandList(option = {}) {
      let landObjList = JSON.parse(mc.world.getDynamicProperty("usf:landList"));
      let landList = [];
      for (let land of landObjList) {
        if((option.playerId !== undefined) && (land.owner.id !== option.playerId)){
          continue;
        };
        if((option.position !== undefined) && !(new Land(land).inLand(option.position))){
          continue;
        }
        landList.push(new Land(land));
      }
      return landList;
    },
    saveLand(landData){
      let landList = JSON.parse(mc.world.getDynamicProperty("usf:landList"));
      for (let index = 0; index < landList.length; index++) {
        if(landData.id !== undefined && landList[index].id === landData.id){
          landList[index] = landData;
        }
      };
      mc.world.setDynamicProperty("usf:landList", JSON.stringify(landList));
    }
  };
};


export class USFPlayer {
  static opLevel = {
    getLevel: (player) => {
      return player.getDynamicProperty("usf:opLevel");
    },
    setLevel: (player, level) => {
      player.setDynamicProperty("usf:opLevel", level);
    }
  }
  static getId = (player) => {
    if (player.getDynamicProperty("usf:playerId") === undefined) {
      player.setDynamicProperty("usf:playerId", mc.world.getDynamicProperty("usf:playerGenId"));
      mc.world.setDynamicProperty("usf:playerGenId", mc.world.getDynamicProperty("usf:playerGenId") + 1);
    }
    return player.getDynamicProperty("usf:playerId");
  };
}