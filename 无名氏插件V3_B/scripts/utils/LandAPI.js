import * as mc from "@minecraft/server";
import {
	ChunkGroup
} from "./ChunkGroupAPI.js";
import {
	Vector,
	IDGenerate
} from "./API.js";

let LandIDList = [];
mc.system.run(() => {
	LandIDList = JSON.parse(
		(mc.world.getDynamicProperty("usf:landIDList") === undefined ? "[]" : mc.world.getDynamicProperty("usf:landIDList"))
	);
});

export class Land {
	/*
	  landData: {
	    member: [{
	    	name: String,
	    	id: String,
	    	permissions: []
	    }],
	    id: String,
	    name: String,
	    dimensionId: String,
	    information: String,
	    chunkId: [],
	    pos : {
	      max: Vector3,
	      min: Vector3
	    },
	    owner: {
	      id: USFPlayer.getId(player);
	      name: player.name
	    }
	  },
	  
	  data: {
	  	pos: {
	  		from: Vector3,
	  		to: Vector3
	  	}
	  }
	*/
	constructor(data) {
		//破坏方块 放置方块 与实体交互 与方块交互
		this.name = data.name;
		this.id = (data.id === undefined ? IDGenerate(LandIDList) : data.id);
		this.member = [];
		this.owner = data.owner;
		this.chunkId = [];
		this.information = data.information;
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
		if (data.member !== undefined) {
			this.member = data.member;
		};
		if(data.chunkId !== undefined){
			this.chunkId = data.chunkId;
		}
	};
	//在领地内

	posInLand(pos) {
		if ((pos.x >= this.pos.min.x) && (pos.x <= this.pos.max.x) && (pos.y >= this.pos.min.y) && (pos.y <= this.pos.max.y) && (pos.z >= this.pos.min.z) && (pos.z <= this.pos.max.z)) {
			return true;
		}
		return false;
	};

	//与另一个领地重叠
	coincide(oland) {
		if (this.dimensionId !== oland.dimensionId) {
			return false;
		} else if (((this.pos.min.x > oland.pos.max.x) || (this.pos.max.x < oland.pos.min.x)) || ((this.pos.min.y > oland.pos.max.y) || (this.pos.max.y < oland.pos.min.y)) || ((this.pos.min.z > oland.pos.max.z) || (this.pos.max.z < oland.pos.min.z))) {
			return false;
		} else {
			return true;
		}
	};

	//与所有领地重叠
	static coincide_allLand(oland) {
		let startChunkGroupPos = new ChunkGroup(0, oland.pos.min).getChunkGroupPosition();
		let endChunkGroupPos = new ChunkGroup(0, oland.pos.max).getChunkGroupPosition();
		for(let chunkX = startChunkGroupPos.x; chunkX <= endChunkGroupPos.x; chunkX++){
			for(let chunkZ = startChunkGroupPos.z; chunkZ <= endChunkGroupPos.z; chunkZ++){
				let currentChunkGroup = new ChunkGroup(1, {x: chunkX, z: chunkZ});
				currentChunkGroup.loadData();
				let landIds = currentChunkGroup.getData(0);
				for(let id of landIds){
					if(Land.manager.getLandFromID(id).coincide(oland)){
						return true;
					}
				}
			}
		}
		return false;
	};


	static manager = {

		addLand(land) {
			//获取最小/最大坐标区块组
			let startChunkGroupPos = new ChunkGroup(0, land.pos.min).getChunkGroupPosition();
			let endChunkGroupPos = new ChunkGroup(0, land.pos.max).getChunkGroupPosition();
			//获取领地所含区块组
			for(let chunkX = startChunkGroupPos.x; chunkX <= endChunkGroupPos.x; chunkX++){
				for(let chunkZ = startChunkGroupPos.z; chunkZ <= endChunkGroupPos.z; chunkZ++){
					//存领地id
					let currentChunkGroup = new ChunkGroup(1, {x: chunkX, z: chunkZ});
					currentChunkGroup.loadData();
					let landIdList = currentChunkGroup.getData(0);
					landIdList.push(land.id);
					currentChunkGroup.setData(0, landIdList);
					currentChunkGroup.saveData();
					land.chunkId.push(`${chunkX}.${chunkZ}`);
				}
			};
			LandIDList.push(`${land.id}`);
			mc.world.setDynamicProperty("usf:landIDList", JSON.stringify(LandIDList));
			mc.world.setDynamicProperty(`usf:landData.${land.id}`, JSON.stringify(land));
		},


		removeLand(land) {
			for(let chunkId of land.chunkId){
				let chunkGroupXZ = chunkId.split('.');
				let currentChunkGroup = new ChunkGroup(1, {x: Number(chunkGroupXZ[0]), z: Number(chunkGroupXZ[1])});
				currentChunkGroup.loadData();
				let landData = currentChunkGroup.getData(0);
				landData.splice(landData.indexOf(land.id), 1);
				currentChunkGroup.setData(0, landData);
				currentChunkGroup.saveData();
			}
			LandIDList.splice(LandIDList.indexOf(land.id), 1);
			mc.world.setDynamicProperty(`usf:landData.${land.id}`, undefined);
			mc.world.setDynamicProperty("usf:landIDList", JSON.stringify(LandIDList));
		},


		getLandList(option = {}) {
			let landList = [];
			for (let landID of LandIDList) {
				let land = Land.manager.getLandFromID(landID);
				if ((option.playerId !== undefined) && !(land.owner.id === option.playerId)) {
					continue;
				};
				if ((option.position !== undefined) && !(land.posInLand(option.position))) {
					continue;
				};
				landList.push(land);
			};
			return landList;
		},
		
		
		getLandFromID(landID){
			return new Land(JSON.parse(mc.world.getDynamicProperty(`usf:landData.${landID}`)));
		},
		
		
		getLandFromPosition(position){
			let currentChunkGroup = new ChunkGroup(0, position);
			currentChunkGroup.loadData();
			for(let landID of currentChunkGroup.getData(0)){
				let land = Land.manager.getLandFromID(landID);
				if(land.posInLand(position)){
					return land;
				}
			};
			return undefined;
		},
		
		
		saveLand(landData) {
			if(LandIDList.includes(landData.id)){
				mc.world.setDynamicProperty(`usf:landData.${landData.id}`, JSON.stringify(landData));
			}
		}
	};
};