import * as mc from "@minecraft/server";
const ChunkGroupSize = 64;
export class ChunkGroup {
	constructor(type, input){
		switch(type){
			case 0:
			case "position":
			{
				this.chunkX = Math.floor(input.x / (16 * ChunkGroupSize));
				this.chunkZ = Math.floor(input.z / (16 * ChunkGroupSize));
			}
			break;
			case 1:
			case "chunk":
			{
				this.chunkX = input.x;
				this.chunkZ = input.z;
			}
			break;
			default:
				throw new Error("不支持的类型");
			break;
		};
		this.startPos = {
			x: this.chunkX * 16,
			z: this.chunkZ * 16
		};
		this.endPos = {
			x: (this.chunkX * 16 + (16 * ChunkGroupSize - 1)),
			z: (this.chunkZ * 16 + (16 * ChunkGroupSize - 1))
		};
		this.landIdList = [];
		this.customAreaIdList = [];
	};
	getChunkGroupPosition() {
		return {
			x: this.chunkX,
			z: this.chunkZ
		};
	};
	getStartPointPosition() {
		return this.startPos;
	};
	getEndPointPosition() {
		return this.endPos;
	};
	getData(type){
		switch(type){
			case 0:
			case "land":
			return this.landIdList;
			break;
			case 1:
			case "customArea":
			return this.customAreaIdList;
			break;
		};
		return undefined;
	};
	setData(type, value){
		switch(type){
			case 0:
			case "land":
				this.landIdList = value;
			break;
			case 1:
			case "customArea":
				this.customAreaIdList = value;
			break;
		};
	};
	loadData(){
		let data = mc.world.getDynamicProperty(`usf:chunkGroup.${this.chunkX}.${this.chunkZ}`);
		if(data !== undefined){
			data = JSON.parse(data);
			this.landIdList = data.landIdList;
			this.customAreaIdList = data.customAreaIdList;
		}
	};
	saveData(){
		mc.world.setDynamicProperty(`usf:chunkGroup.${this.chunkX}.${this.chunkZ}`, JSON.stringify(this));
	};
};
